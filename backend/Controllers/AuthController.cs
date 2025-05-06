using backend.data;
using backend.Dtos;
using backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly EduSyncDbContext _context;
        private readonly PasswordHasher<User> _passwordHasher = new();

        public AuthController(IConfiguration config, EduSyncDbContext context)
        {
            _config = config;
            _context = context;
        }

        // User Registration Endpoint
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            // Check if the email already exists in the database
            if (_context.Users.Any(u => u.Email == dto.Email))
                return BadRequest("User already exists");

            // Create a new User object
            var user = new User
            {
                UserId = Guid.NewGuid(),
                Name = dto.Name,
                Email = dto.Email,
                Role = dto.Role
            };

            // Hash the user's password and set it in the user object
            user.PasswordHash = _passwordHasher.HashPassword(user, dto.Password);

            // Add the user to the context and save changes
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok("User registered successfully");
        }

        // User Login Endpoint
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            // Look for the user by email
            var user = await _context.Users.SingleOrDefaultAsync(u => u.Email == dto.Email);
            if (user == null)
                return Unauthorized("Invalid credentials");

            // Verify the password
            var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, dto.Password);
            if (result != PasswordVerificationResult.Success)
                return Unauthorized("Invalid credentials");

            // Generate a JWT token
            var token = GenerateJwtToken(user);

            // Return the response with the token, role, email, and user's name
            return Ok(new
            {
                jwt = token,
                role = user.Role,
                email = user.Email,
                name = user.Name  // Added the user's name to the response
            });
        }

        // Helper method to generate the JWT token
        private string GenerateJwtToken(User user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),  // Unique user identifier
                new Claim(ClaimTypes.Email, user.Email),  // User's email
                new Claim(ClaimTypes.Role, user.Role),  // User's role (Instructor, Admin, etc.)
            };

            // Create a symmetric security key using a secret key from the configuration
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // Create the JWT token
            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],  // The issuer of the token (your app name)
                audience: _config["Jwt:Audience"],  // The intended audience (usually your app's users)
                claims: claims,  // Add the claims
                expires: DateTime.UtcNow.AddMinutes(Convert.ToDouble(_config["Jwt:ExpiresInMinutes"])),  // Expiration time
                signingCredentials: creds  // Signing credentials
            );

            // Return the token as a string
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}

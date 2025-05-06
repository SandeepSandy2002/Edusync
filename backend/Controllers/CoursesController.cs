using backend.data;
using backend.Dtos;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Linq;

[ApiController]
[Route("api/[controller]")]
public class CoursesController : ControllerBase
{
    private readonly EduSyncDbContext _context;
    private readonly BlobStorageService _blobService;

    public CoursesController(EduSyncDbContext context, BlobStorageService blobService)
    {
        _context = context;
        _blobService = blobService;
    }

    // POST method to add course (already implemented)
    [HttpPost]
    [Authorize(Roles = "Instructor")]
    public async Task<IActionResult> AddCourse([FromForm] CourseCreateDto dto)
    {
        var instructorId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (dto.MediaFile == null || dto.MediaFile.Length == 0)
            return BadRequest("Media file is required.");

        var mediaUrl = await _blobService.UploadFileAsync(dto.MediaFile);

        var course = new Course
        {
            CourseId = Guid.NewGuid(),
            Title = dto.Title,
            Description = dto.Description,
            InstructorId = Guid.Parse(instructorId),
            MediaUrl = mediaUrl
        };

        _context.Courses.Add(course);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Course created successfully", course });
    }

    // GET method to fetch courses by title, with instructor details (without modifying the model)
    [HttpGet("title/{title}")]
    [Authorize]
    public async Task<IActionResult> GetCoursesByTitle(string title)
    {
        // Fetch courses with the instructor's details without using 'Contains' directly in the query
        var coursesWithInstructor = await (from course in _context.Courses
                                           join instructor in _context.Users on course.InstructorId equals instructor.UserId
                                           select new
                                           {
                                               course.CourseId,
                                               course.Title,
                                               course.Description,
                                               course.MediaUrl,
                                               InstructorName = instructor.Name,
                                               InstructorEmail = instructor.Email
                                           }).ToListAsync();

        // Filter the results after fetching them (client-side)
        var filteredCourses = coursesWithInstructor
            .Where(c => c.Title.Contains(title, StringComparison.OrdinalIgnoreCase)) // Case-insensitive search
            .ToList();

        if (!filteredCourses.Any())
        {
            return NotFound($"No courses found with the title '{title}'.");
        }

        return Ok(filteredCourses);
    }
    [HttpGet("allcourses")]
    [Authorize]
    public async Task<IActionResult> GetAllCourses()
    {
        var coursesWithInstructor = await (from course in _context.Courses
                                           join instructor in _context.Users on course.InstructorId equals instructor.UserId
                                           select new
                                           {
                                               course.CourseId,
                                               course.Title,
                                               course.Description,
                                               course.MediaUrl,
                                               InstructorName = instructor.Name,
                                               InstructorEmail = instructor.Email
                                           }).ToListAsync();

        if (!coursesWithInstructor.Any())
        {
            return NotFound("No courses available.");
        }

        return Ok(coursesWithInstructor);
    }
    // GET method to fetch courses by instructor name
    [HttpGet("instructor/{name}")]
    [Authorize]
    public async Task<IActionResult> GetCoursesByInstructorName(string name)
    {
        var coursesWithInstructor = await (from course in _context.Courses
                                           join instructor in _context.Users on course.InstructorId equals instructor.UserId
                                           where instructor.Name.ToLower().Contains(name.ToLower())
                                           select new
                                           {
                                               course.CourseId,
                                               course.Title,
                                               course.Description,
                                               course.MediaUrl,
                                               InstructorName = instructor.Name,
                                               InstructorEmail = instructor.Email
                                           }).ToListAsync();

        if (!coursesWithInstructor.Any())
        {
            return NotFound($"No courses found for instructor name containing '{name}'.");
        }

        return Ok(coursesWithInstructor);
    }

}

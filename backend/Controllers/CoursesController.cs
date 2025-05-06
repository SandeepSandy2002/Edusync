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

    [HttpGet("mycourses")]
    [Authorize(Roles = "Instructor")]
    public async Task<IActionResult> GetMyCourses()
    {
        var instructorIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(instructorIdClaim) || !Guid.TryParse(instructorIdClaim, out Guid instructorId))
        {
            return Unauthorized("Invalid instructor ID.");
        }

        var myCourses = await (from course in _context.Courses
                               where course.InstructorId == instructorId
                               select new
                               {
                                   course.CourseId,
                                   course.Title,
                                   course.Description,
                                   course.MediaUrl
                               }).ToListAsync();

        if (!myCourses.Any())
        {
            return NotFound("You have not uploaded any courses.");
        }

        return Ok(myCourses);
    }

    [HttpDelete("delcourse/{courseId}")]
    [Authorize(Roles = "Instructor")]
    public async Task<IActionResult> DeleteCourse(Guid courseId)
    {
        var instructorId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var course = await _context.Courses.FirstOrDefaultAsync(c => c.CourseId == courseId);

        if (course == null)
            return NotFound("Course not found.");

        if (course.InstructorId.ToString() != instructorId)
            return Forbid("You are not authorized to delete this course.");

        _context.Courses.Remove(course);
        await _context.SaveChangesAsync();

        return Ok("Course deleted successfully.");
    }


    [HttpPut("updatecourse/{courseId}")]
    [Authorize(Roles = "Instructor")]
    public async Task<IActionResult> UpdateCourse(Guid courseId, [FromForm] CourseUpdateDto dto)
    {
        var instructorId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var course = await _context.Courses.FirstOrDefaultAsync(c => c.CourseId == courseId);

        if (course == null)
            return NotFound("Course not found.");

        if (course.InstructorId.ToString() != instructorId)
            return Forbid("You are not authorized to edit this course.");

        // Update fields
        if (!string.IsNullOrEmpty(dto.Title)) course.Title = dto.Title;
        if (!string.IsNullOrEmpty(dto.Description)) course.Description = dto.Description;

        if (dto.MediaFile != null && dto.MediaFile.Length > 0)
        {
            var mediaUrl = await _blobService.UploadFileAsync(dto.MediaFile);
            course.MediaUrl = mediaUrl;
        }

        await _context.SaveChangesAsync();

        return Ok(new { message = "Course updated successfully.", course });
    }

}

// backend/Controllers/CoursesController.cs
using backend.data;
using backend.Dtos;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

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

    [HttpGet("title/{title}")]
    [Authorize]
    public async Task<IActionResult> GetCoursesByTitle(string title)
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

        var filteredCourses = coursesWithInstructor
            .Where(c => c.Title.Contains(title, StringComparison.OrdinalIgnoreCase))
            .ToList();

        if (!filteredCourses.Any())
            return NotFound($"No courses found with the title '{title}'.");

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
            return NotFound("No courses available.");

        return Ok(coursesWithInstructor);
    }

    [HttpGet("mycourses")]
    [Authorize(Roles = "Instructor")]
    public async Task<IActionResult> GetMyCourses()
    {
        var instructorIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(instructorIdClaim, out Guid instructorId))
            return Unauthorized("Invalid instructor ID.");

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
            return Ok(new { message = "You have not uploaded any courses yet.", courses = new List<object>() });

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

        await _blobService.DeleteFileAsync(course.MediaUrl);
        _context.Courses.Remove(course);
        await _context.SaveChangesAsync();

        return Ok("Course deleted successfully.");
    }

    [HttpDelete("delete-course-by-title/{title}")]
    [Authorize(Roles = "Instructor")]
    public async Task<IActionResult> DeleteCourseByTitle(string title)
    {
        var instructorId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var coursesToDelete = await _context.Courses
            .Where(c => c.Title.ToLower() == title.ToLower() && c.InstructorId.ToString() == instructorId)
            .ToListAsync();

        if (!coursesToDelete.Any())
            return NotFound("No courses found for the given title.");

        foreach (var course in coursesToDelete)
        {
            if (!string.IsNullOrEmpty(course.MediaUrl))
            {
                await _blobService.DeleteFileAsync(course.MediaUrl);
            }
        }

        _context.Courses.RemoveRange(coursesToDelete);
        await _context.SaveChangesAsync();

        return Ok("All files and records for the specified instructor and course title were deleted successfully.");
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

    [HttpPut("replace")]
    [Authorize(Roles = "Instructor")]
    public async Task<IActionResult> ReplaceMediaFile([FromForm] IFormFile MediaFile, [FromForm] string ExistingMediaUrl)
    {
        if (MediaFile == null || string.IsNullOrEmpty(ExistingMediaUrl))
            return BadRequest("Invalid file or media URL.");

        var course = await _context.Courses.FirstOrDefaultAsync(c => c.MediaUrl == ExistingMediaUrl);
        if (course == null)
            return NotFound("Course not found for the given media URL.");

        var newUrl = await _blobService.UploadFileAsync(MediaFile);
        course.MediaUrl = newUrl;
        await _context.SaveChangesAsync();

        return Ok(new { message = "File replaced successfully.", newUrl });
    }

    [HttpPut("update-description")]
    [Authorize(Roles = "Instructor")]
    public async Task<IActionResult> UpdateDescription([FromBody] UpdateDescriptionDto dto)
    {
        var course = await _context.Courses.FirstOrDefaultAsync(c => c.MediaUrl == dto.MediaUrl);
        if (course == null)
            return NotFound("Course not found.");

        course.Description = dto.Description;
        await _context.SaveChangesAsync();

        return Ok("Description updated.");
    }

    [HttpDelete("delete-file")]
    [Authorize(Roles = "Instructor")]
    public async Task<IActionResult> DeleteFile([FromBody] DeleteFileDto dto)
    {
        var course = await _context.Courses.FirstOrDefaultAsync(c => c.MediaUrl == dto.MediaUrl);
        if (course == null)
            return NotFound("File not associated with any course.");

        await _blobService.DeleteFileAsync(course.MediaUrl);
        _context.Courses.Remove(course);
        await _context.SaveChangesAsync();

        return Ok("File deleted.");
    }
}

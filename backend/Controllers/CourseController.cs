using Microsoft.AspNetCore.Mvc;
using backend.Models;
using backend.data;
using System.Linq;
using backend.data;
using backend.Models;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CourseController : ControllerBase
    {
        private readonly EduSyncDbContext _context;

        public CourseController(EduSyncDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetCourses()
        {
            var courses = _context.Courses.ToList();
            return Ok(courses);
        }

        [HttpPost]
        public IActionResult CreateCourse([FromBody] Course course)
        {
            _context.Courses.Add(course);
            _context.SaveChanges();
            return CreatedAtAction(nameof(GetCourses), new { id = course.CourseId }, course);
        }
    }
}

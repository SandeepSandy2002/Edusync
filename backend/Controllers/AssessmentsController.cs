using Azure.Messaging.EventHubs;
using Azure.Messaging.EventHubs.Producer;
using backend.Dtos;
using backend.Models;
using backend.data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AssessmentsController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly EduSyncDbContext _context;

        public AssessmentsController(IConfiguration configuration, EduSyncDbContext context)
        {
            _configuration = configuration;
            _context = context;
        }

        //SUBMIT QUIZ RESULT → Event Hub
        [HttpPost("submit")]
        [Authorize]
        public async Task<IActionResult> SubmitQuiz([FromBody] QuizResultDto dto)
        {
            try
            {
                string connectionString = _configuration["EventHub:ConnectionString"];
                string eventHubName = "event1";

                await using var producerClient = new EventHubProducerClient(connectionString, eventHubName);

                using EventDataBatch eventBatch = await producerClient.CreateBatchAsync();
                string jsonPayload = JsonSerializer.Serialize(dto);

                if (!eventBatch.TryAdd(new EventData(jsonPayload)))
                {
                    return BadRequest("Payload too large for Event Hub batch.");
                }

                await producerClient.SendAsync(eventBatch);
                return Ok(new { message = "Quiz result sent to Event Hub." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Event Hub error: {ex.Message}");
                return StatusCode(500, $"Failed to send data to Event Hub: {ex.Message}");
            }
        }

        
        [HttpGet("results/user/{userId}")]
        [Authorize]
        public async Task<IActionResult> GetUserResults(string userId)
        {
            userId = userId.ToLower();

            var results = await _context.Results
                .Where(r => r.UserId.ToLower() == userId)
                .Select(r => new
                {
                    r.AssessmentId,
                    r.CourseId,
                    r.UserId,
                    r.InstructorEmail,
                    r.Score,
                    AttemptDate = r.SubmittedAt,
                    AssessmentTitle = r.AssessmentId,
                    MaxScore = 15 // Static for now
                })
                .ToListAsync();

            return Ok(results);
        }

        // GET: api/assessments/results/all (Instructor view)
        [HttpGet("results/all")]
        [Authorize(Roles = "Instructor")]
        public async Task<IActionResult> GetAllResults()
        {
            var results = await _context.Results
                .Join(_context.Users,
                      r => r.UserId.ToLower(),
                      u => u.Email.ToLower(),
                      (r, u) => new
                      {
                          r.AssessmentId,
                          r.CourseId,
                          r.UserId,
                          r.InstructorEmail,
                          r.Score,
                          AttemptDate = r.SubmittedAt,
                          StudentName = u.Name,
                          MaxScore = 15
                      })
                .ToListAsync();

            return Ok(results);
        }
    }
}

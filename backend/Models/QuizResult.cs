namespace backend.Models
{
    public class QuizResult
    {
        public int Id { get; set; }  // Optional: You can remove this if not needed as primary key

        public string Answers { get; set; }         // JSON string like {"0":"A compiler", "1":"useEffect"}
        public string AssessmentId { get; set; }    // Changed from Guid to string to match payload
        public string CourseId { get; set; }        // Changed from Guid to string
        public string UserId { get; set; }
        public string InstructorEmail { get; set; }
        public int Score { get; set; }
        public DateTime SubmittedAt { get; set; }

        // These are Stream Analytics system-generated metadata fields
        public DateTime EventProcessedUtcTime { get; set; }
        public string PartitionId { get; set; }
        public DateTime EventEnqueuedUtcTime { get; set; }
    }
}

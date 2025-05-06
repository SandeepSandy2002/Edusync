namespace backend.Models
{
    public class Result
    {
        public Guid ResultId { get; set; }
        public Guid AssessmentId { get; set; }  // Foreign key to Assessment
        public Guid UserId { get; set; }  // Foreign key to User
        public int Score { get; set; }
        public DateTime AttemptDate { get; set; }
    }
}

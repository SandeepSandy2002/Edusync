namespace backend.Models
{
    public class Course
    {
        public Guid CourseId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public Guid InstructorId { get; set; }  // Foreign key to User
        public string MediaUrl { get; set; }
    }
}

namespace Showcase_Chat.Models
{
    public class Message
    {
        public string Id { get; set; }
        public string User {  get; set; }
        public string Content { get; set; }
        public DateTime Timestamp { get; set; }
    }
}

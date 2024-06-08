namespace Showcase_Chat.Models
{
    public class MessageModel
    {
        public string Id { get; set; }
        public string User {  get; set; }
        public string Text { get; set; }
        public DateTime Timestamp { get; set; }
    }
}

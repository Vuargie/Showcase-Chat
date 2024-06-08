using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Showcase_Chat.Models;

namespace Showcase_Chat.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private static List<Message> Messages = new List<Message>();

        public async Task SendMessage(string message)
        {
            var userName = Context.User.Identity.Name;
            var newMessage = new Message
            {
                Id = Guid.NewGuid().ToString(),
                User = userName,
                Content = message,
                Timestamp = DateTime.Now
            };

            Messages.Add(newMessage);
            await Clients.All.SendAsync("ReceiveMessage", newMessage.Id, userName, message);
        }

        /*        public async Task SendMessage(string message)
                {
                    var userName = Context.User.Identity.Name;
                    var messageId = Guid.NewGuid().ToString(); // Generate a unique ID for the message
                    await Clients.All.SendAsync("ReceiveMessage", messageId, userName, message);
                }*/



        public async Task DeleteMessage(string messageId)
        {
            var message = Messages.FirstOrDefault(m => m.Id == messageId);
            if (message != null && message.User == Context.User.Identity.Name)
            {
                Messages.Remove(message);
                await Clients.All.SendAsync("MessageDeleted", messageId);
            }
        }
    }
}

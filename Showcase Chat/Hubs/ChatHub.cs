using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Showcase_Chat.Models;
using System.Collections.Concurrent;

namespace Showcase_Chat.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private static readonly ConcurrentDictionary<string, string> ConnectedUsers = new ConcurrentDictionary<string, string>();

        public override async Task OnConnectedAsync()
        {
            var userName = Context.User.Identity.Name;
            if (userName != null)
            {
                ConnectedUsers[Context.ConnectionId] = userName;
                await Clients.All.SendAsync("UserJoined", userName);
                await Clients.Caller.SendAsync("UpdateUserList", ConnectedUsers.Values.ToList());
            }
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var userName = Context.User.Identity.Name;
            if (userName != null)
            {
                ConnectedUsers.TryRemove(Context.ConnectionId, out _);
                await Clients.All.SendAsync("UserLeft", userName);
            }
            await base.OnDisconnectedAsync(exception);
        }

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

        public async Task DeleteMessage(string messageId)
        {
            var message = Messages.FirstOrDefault(m => m.Id == messageId);
            if (message != null && message.User == Context.User.Identity.Name)
            {
                Messages.Remove(message);
                await Clients.All.SendAsync("MessageDeleted", messageId);
            }
        }

        [Authorize(Roles = "Admin")]
        public async Task KickUser(string userName)
        {
            var connectionId = ConnectedUsers.FirstOrDefault(u => u.Value == userName).Key;
            if (connectionId != null)
            {
                await Clients.Client(connectionId).SendAsync("Kicked", "You have been kicked by an admin.");
                ConnectedUsers.TryRemove(connectionId, out _);
                await Clients.All.SendAsync("UserLeft", userName);
                await Task.Delay(500); // Delay to allow the message to be sent before disconnecting
                Context.Abort();
            }
        }
    }
}

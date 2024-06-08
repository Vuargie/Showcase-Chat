using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Showcase_Chat.Models;

namespace Showcase_Chat.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        public async Task SendMessage(string message)
        {
            var userName = Context.User.Identity.Name;
            await Clients.All.SendAsync("ReceiveMessage", userName, message);
        }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using PusherRESTDotNet;
using PusherRESTDotNet.Authentication;

namespace CanvasDemo.Controllers
{
    public class PusherController : Controller
    {
        // TODO: Complete these settings with your app details
        const string SETTING_PUSHER_APPID = "";
        const string SETTING_PUSHER_KEY = "";
        const string SETTING_PUSHER_SECRET = "";
        const string SETTING_PUSHER_CHANNEL = "public-squares";

        // GET: /Pusher/Auth
        public ContentResult Auth(string username)
        {
            // Connect to Pusher REST API
            var provider = new PusherProvider(SETTING_PUSHER_APPID, SETTING_PUSHER_KEY, SETTING_PUSHER_SECRET);
            string result = null;

            // Gather channel name and socket id
            string channel_name = Request.Form["channel_name"];
            string socket_id = Request.Form["socket_id"];

            // If presence channel
            if (channel_name.StartsWith("presence-"))
            {
                var userInfo = new BasicUserInfo();
                userInfo.name = username;

                result = provider.Authenticate(channel_name, socket_id,
                    new PusherRESTDotNet.Authentication.PresenceChannelData()
                    {
                        user_id = socket_id,
                        user_info = userInfo
                    });
            }
            // If private channel
            else if (channel_name.StartsWith("private-"))
                result = provider.Authenticate(channel_name, socket_id);

            return new ContentResult() { Content = result };
        }

        // GET: /Pusher/MoveSquare
        public EmptyResult MoveSquare(string squareId, int top, int left, string socketId)
        {
            var provider = new PusherProvider(SETTING_PUSHER_APPID, SETTING_PUSHER_KEY, SETTING_PUSHER_SECRET);

            provider.Trigger(new ObjectPusherRequest(SETTING_PUSHER_CHANNEL, "update-square", new
            {
                squareId = squareId,
                top = top,
                left = left,
                originatingSocketId = socketId
            }
            ));

            return new EmptyResult();
        }

        // GET: /Pusher/AddSquare
        public EmptyResult AddSquare(string squareId, string socketId)
        {
            var provider = new PusherProvider(SETTING_PUSHER_APPID, SETTING_PUSHER_KEY, SETTING_PUSHER_SECRET);

            provider.Trigger(new ObjectPusherRequest(SETTING_PUSHER_CHANNEL, "add-square", new
            {
                squareId = squareId,
                originatingSocketId = socketId
            }
            ));

            return new EmptyResult();
        }

    }
}

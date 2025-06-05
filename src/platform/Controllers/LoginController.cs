using Sitecore.Mvc.Controllers;
using Sitecore.Security.Authentication;
using System;
using System.Web.Mvc;
using Sitecore.Security.Accounts;

namespace XmCloudSXAStarter.Controllers
{
    public class LoginController : SitecoreController
    {
        [AcceptVerbs("GET", "POST")]
        public ActionResult VirtualLogin(string username)
        {
            try
            {
                // Validate input
                if (string.IsNullOrEmpty(username))
                {
                    return Json(new { success = false, message = "Username is required" });
                }

                // Clean up the username to ensure it's valid
                username = username.Replace(" ", "_");

                // Logout current user if any
                AuthenticationManager.Logout();

                // Create virtual user
                var virtualUser = CreateVirtualUser(username);

                // Login as the virtual user
                AuthenticationManager.LoginVirtualUser(virtualUser);

                return Json(new
                {
                    success = true,
                    message = $"Logged in successfully as {username}",
                    user = new
                    {
                        name = virtualUser.Name,
                        displayName = virtualUser.Profile.FullName,
                        isAuthenticated = true
                    }
                });
            }
            catch (Exception ex)
            {
                Sitecore.Diagnostics.Log.Error("Error in virtual login", ex, this);
                return Json(new { success = false, message = "Login failed: " + ex.Message });
            }
        }

        private User CreateVirtualUser(string username)
        {
            // Create a virtual user with the specified username
            //var virtualUser = new User("extranet\\" + username, true);

            //// Set up some profile properties
            //virtualUser.Profile.FullName = username;
            //virtualUser.Profile.Email = $"{username}@example.com";

            var virtualUser = AuthenticationManager.BuildVirtualUser("extranet\\" + username, true);

            virtualUser.Profile.FullName = username;
            virtualUser.Profile.Email = $"{username}@example.com";

            // Assign roles (e.g., based on user profile or external data)
            virtualUser.Roles.Add(Sitecore.Security.Accounts.Role.FromName("sitecore\\PremiumUsers"));
            AuthenticationManager.LoginVirtualUser(virtualUser);

            // Grant some roles if needed
            // virtualUser.Roles.Add(Role.FromName("extranet\\ExampleRole"));

            return virtualUser;
        }
    }
}
using Microsoft.IdentityModel.Tokens;
using Sitecore.Mvc.Controllers;
using Sitecore.Security.Accounts;
using Sitecore.Security.Authentication;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Web.Mvc;

namespace XmCloudSXAStarter.Controllers
{
    public class LoginController : SitecoreController
    {
        [AcceptVerbs(HttpVerbs.Get | HttpVerbs.Post)]
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
                        isAuthenticated = true,
                        token = GenerateApplicationToken(virtualUser.Profile.Email, virtualUser.Roles.Select(r => r.Name).ToList())
                    }
                }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                Sitecore.Diagnostics.Log.Error("Error in virtual login", ex, this);
                return Json(new { success = false, message = "Login failed: " + ex.Message });
            }
        }

        private string GenerateApplicationToken(string email, List<string> roles)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = System.Text.Encoding.ASCII.GetBytes("1234");

            var claims = new List<Claim>
        {
            new Claim("email", email),
            new Claim("iss", "your-app"),
            new Claim("aud", "nextjs-app")
        };

            // Add role claims
            foreach (var role in roles)
            {
                claims.Add(new Claim("roles", role));
            }

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(1),
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
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
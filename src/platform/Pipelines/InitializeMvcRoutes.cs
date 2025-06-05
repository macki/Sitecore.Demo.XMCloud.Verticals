using Sitecore.Pipelines;
using System.Web.Mvc;
using System.Web.Routing;

namespace XmCloudSXAStarter.Pipelines
{
    public class InitializeMvcRoutes
    {
        public void Process(PipelineArgs args)
        {
            RouteTable.Routes.MapRoute(
                name: "LoginRoute",
                url: "api/login/{action}",
                defaults: new { controller = "Login", action = "VirtualLogin" },
                namespaces: new[] { "XmCloudSXAStarter.Controllers" }
            );
            
            // Keep any other routes you need
            RouteTable.Routes.MapRoute(
                name: "MyApiRoute",
                url: "api/my/{action}",
                defaults: new { controller = "My", action = "MyAction" },
                namespaces: new[] { "XmCloudSXAStarter.Controllers" }
            );
        }
    }
}
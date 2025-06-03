using Sitecore.Mvc.Controllers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace XmCloudSXAStarter.Controllers
{
    public class MyController : SitecoreController
    {
        public ActionResult MyAction()
        {
            // Your controller logic here
            return Json(new { success = true, message = "Hello from XM Cloud controller" }, JsonRequestBehavior.AllowGet);
        }
    }
}
using Android.App;
using Android.Widget;
using Android.OS;

namespace Spot_Market
{
    [Activity(Label = "Spot Market", MainLauncher = true, Icon = "@drawable/icon")]
    public class MainActivity : Activity
    {
        
        protected override void OnCreate(Bundle bundle)
        {
            base.OnCreate(bundle);
            SetContentView(Resource.Layout.Login);
            Button login = FindViewById<Button>(Resource.Id.button1); //Declare login button
            Button register = FindViewById<Button>(Resource.Id.button2);

            // Set our view from the "main" layout resource

            login.Click += delegate {
                StartActivity(typeof(Map)); //Load second activity
            };
            register.Click += delegate
            {
                StartActivity(typeof(Register));
            };
        }
    }
}

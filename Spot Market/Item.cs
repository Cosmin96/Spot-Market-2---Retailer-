using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

using Android.App;
using Android.Content;
using Android.OS;
using Android.Runtime;
using Android.Views;
using Android.Widget;

namespace Spot_Market
{
    [Activity(Label = "Items")]
    public class Item : Activity
    {
        protected override void OnCreate(Bundle savedInstanceState)
        {
            base.OnCreate(savedInstanceState);
            SetContentView(Resource.Layout.Items);

            Button button = FindViewById<Button>(Resource.Id.button1);
            Button button2 = FindViewById<Button>(Resource.Id.button2);
            button.Click += delegate
            {
                var map = new Intent(this, typeof(Map));
                map.PutExtra("Data", "bicycle");
                StartActivity(map);
            };
            button2.Click += delegate
            {
                var map = new Intent(this, typeof(Map));
                map.PutExtra("Data", "book");
                StartActivity(map);
            };
        }
    }
}
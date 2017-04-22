using Android.App;
using Android.OS;
using Android.Widget;
using Android.Graphics;
using Android.Graphics.Drawables;
using Android.Util;
using System;
using Java.Util;
using System.Collections.Generic;
using System.Linq;
using Android.Bluetooth;
using Android.Content;

namespace Spot_Market
{
    /// <summary>
    /// Activity for drawing the store's map and the user's location on the map
    /// </summary>
    [Activity(Label = "Map")]
    public class Map : Activity
    {
        static readonly string TAG = typeof(Map).Name;

        /// <summary>
        /// Canvas on which the map of the store and the user's location are drawn
        /// </summary>
        private static Canvas canvas;
        private static int zoneToHighlight = 0;
        private static List<List<Position>> zones;

        // Bitmaps used to render the image, used to restore the canvas to the initial state with the store's map on it
        private static Bitmap mutableBitmap;
        private static Bitmap workingBitmap;
        
        // ImageView with the store's map
        private static ImageView map;
        
        // The radius of the points drawn on canvas
        private static int pointRadius = 10;

        private LocateUser _locateUser;

        protected override void OnCreate(Bundle savedInstanceState)
        {
            base.OnCreate(savedInstanceState);
            SetContentView(Resource.Layout.Map);

            BluetoothAdapter mBluetoothAdapter = BluetoothAdapter.DefaultAdapter;
            if (!mBluetoothAdapter.IsEnabled)
            {
                mBluetoothAdapter.Enable();
            }

            //Set BitmapFactory options in order to draw on the store's map
            BitmapFactory.Options myOptions = new BitmapFactory.Options();
            myOptions.InDither = true;
            myOptions.InScaled = false;
            myOptions.InPreferredConfig = Bitmap.Config.Argb8888;
            myOptions.InPurgeable = true;

            //Created Bitmap with map resource
            Bitmap bitmap = BitmapFactory.DecodeResource(Resources, Resource.Drawable.map6, myOptions);

            //Bitmap used to render the image
            workingBitmap = Bitmap.CreateBitmap(bitmap);

            //ImageView that displays the image 
            map = FindViewById<ImageView>(Resource.Id.imageView1);
            Drawable mapPhoto = GetDrawable(Resource.Drawable.map6);
            map.SetImageDrawable(mapPhoto);
            map.SetAdjustViewBounds(true);

            zones = getZones();

            _locateUser = new LocateUser(this);
            // Start the thread that is searching for beacons and is doing the positioning algorithm
            _locateUser.FindBeacons(this);

            // Check Data received by Intent in Item Activity, if returning from the Items screen
            string data = Intent.GetStringExtra("Data");

            switch (data)
            {
                case "bicycle":
                    zoneToHighlight = 2;
                    break;
                case "book":
                    zoneToHighlight = 4;
                    break;
                default:
                    zoneToHighlight = 6;
                    break;
            }

            //Declare item button
            Button item = FindViewById<Button>(Resource.Id.button1); 
            item.Click += delegate
            {
                StartActivity(typeof(Item));
                _locateUser.Stop();
            };
        }

        /// <summary>
        /// Restores the canvas back to the initial state when it only had the map of the store drawn on it (on the store's map)
        /// </summary> 
        public static void refreshCanvas()
        {
            mutableBitmap = workingBitmap.Copy(Bitmap.Config.Argb8888, true);
            canvas = new Canvas(mutableBitmap);
            map.SetImageBitmap(mutableBitmap);

            GC.Collect();
        }

        /// <summary>
        /// Draws a point on the canvas (on the store's map)
        /// </summary> 
        /// <param name="x">X coordinate of the point you want to draw</param>
        /// <param name="y">Y coordinate of the point you want to draw</param>
        /// <param name="color">The color you want the point to be drawn with</param>
        public static void drawPointOnMap(int x, int y, string color)
        {
            Paint paint = new Paint();
            switch(color)
            {
                case "red":
                    paint.SetARGB(255, 255, 0, 0);
                    break;
                case "green":
                    paint.SetARGB(255, 0, 255, 0);
                    break;
                case "blue":
                    paint.SetARGB(255, 0, 0, 255);
                    break;
                case "cyan":
                    paint.SetARGB(255, 0, 255, 255);
                    break;
                case "yellow":
                    paint.SetARGB(255, 255, 255, 0);
                    break;
                case "purple":
                    paint.SetARGB(255, 255, 0, 255);
                    break;
                default:
                    paint.SetARGB(255, 0, 0, 0);
                    break;
            }
            paint.AntiAlias = true;
            refreshCanvas();
            highlightZone(zoneToHighlight);

            canvas.DrawCircle(x, y, pointRadius, paint);
        }

        /// <summary>
        /// Highlight a specific zone given x and y coordinates of the zone's vertices
        /// </summary> 
        /// <param name="zoneToHighlightIndex">Index of zone that needs to be highlighted</param>
        private static void highlightZone(int zoneToHighlightIndex)
        {
            if (zoneToHighlightIndex == -1)
            {
                return;
            }
            List<Position> zoneHighlight = zones.ElementAt(zoneToHighlightIndex);


            Paint zonePaint = new Paint();
            zonePaint.SetARGB(255, 255, 255, 255);
            zonePaint.SetStyle(Paint.Style.FillAndStroke);
            zonePaint.AntiAlias = true;

            Paint contourPaint = new Paint();
            contourPaint.SetARGB(255, 255, 0, 0);
            contourPaint.SetStyle(Paint.Style.Stroke);
            contourPaint.AntiAlias = true;

            Path zone = new Path();
            Path contour = new Path();

            int ok = 0;
            foreach (Position p in zoneHighlight)
            {
                if(ok == 0)
                {
                    zone.MoveTo(p.getX(), p.getY());
                    contour.MoveTo(p.getX(), p.getY());
                    ok = 1;
                }
                else
                {
                    zone.LineTo(p.getX(), p.getY());
                    contour.LineTo(p.getX(), p.getY());
                }

            }
            zone.LineTo(zoneHighlight.ElementAt(0).getX(), zoneHighlight.ElementAt(0).getY());
            contour.LineTo(zoneHighlight.ElementAt(0).getX(), zoneHighlight.ElementAt(0).getY());

            zone.Close();
            contour.Close();

            canvas.DrawPath(zone, zonePaint);
            canvas.DrawPath(contour, contourPaint);
        }

        private static string getZonesCsvContent()
        {
            // TODO: properly retrieve data from a file
            string content = "Number of vertices, Vertices' coordinates, Zone ID\n6, 133, 57, 350, 57, 350, 148, 348, 148, 348, 209, 133, 209, 1\n4, 351, 59, 455, 59, 455, 148, 351, 148, 2\n8, 349, 149, 457, 149, 457, 150, 548, 150, 548, 399, 457, 399, 457, 210, 349, 210, 3\n4, 549, 149, 620, 149, 620, 256, 549, 256, 4\n8, 131, 210, 348, 210, 348, 211, 456, 211, 456, 399, 453, 399, 453, 401, 131, 401, 5\n14, 549, 257, 621, 257, 621, 254, 762, 254, 762, 399, 759, 399, 759, 400, 758, 400, 758, 401, 757, 401, 757, 403, 688, 403, 688, 399, 549, 399, 6\n528, 454, 400, 687, 400, 687, 404, 757, 404, 757, 405, 756, 405, 756, 406, 755, 406, 755, 407, 754, 407, 754, 408, 753, 408, 753, 409, 752, 409, 752, 411, 751, 411, 751, 412, 750, 412, 750, 413, 749, 413, 749, 414, 748, 414, 748, 415, 747, 415, 747, 417, 746, 417, 746, 418, 745, 418, 745, 419, 744, 419, 744, 420, 743, 420, 743, 421, 742, 421, 742, 423, 741, 423, 741, 424, 740, 424, 740, 425, 739, 425, 739, 426, 738, 426, 738, 427, 737, 427, 737, 429, 736, 429, 736, 430, 735, 430, 735, 431, 734, 431, 734, 432, 733, 432, 733, 433, 732, 433, 732, 435, 731, 435, 731, 436, 730, 436, 730, 437, 729, 437, 729, 438, 728, 438, 728, 439, 727, 439, 727, 441, 726, 441, 726, 442, 725, 442, 725, 443, 724, 443, 724, 444, 723, 444, 723, 445, 722, 445, 722, 447, 721, 447, 721, 448, 720, 448, 720, 449, 719, 449, 719, 450, 718, 450, 718, 451, 717, 451, 717, 453, 716, 453, 716, 454, 715, 454, 715, 455, 714, 455, 714, 456, 713, 456, 713, 457, 712, 457, 712, 459, 711, 459, 711, 460, 710, 460, 710, 461, 709, 461, 709, 462, 708, 462, 708, 463, 707, 463, 707, 465, 706, 465, 706, 466, 705, 466, 705, 467, 704, 467, 704, 468, 703, 468, 703, 469, 702, 469, 702, 471, 701, 471, 701, 472, 700, 472, 700, 473, 699, 473, 699, 474, 698, 474, 698, 475, 697, 475, 697, 477, 696, 477, 696, 478, 695, 478, 695, 479, 694, 479, 694, 480, 693, 480, 693, 481, 692, 481, 692, 483, 691, 483, 691, 484, 690, 484, 690, 485, 689, 485, 689, 486, 688, 486, 688, 487, 687, 487, 687, 489, 686, 489, 686, 490, 685, 490, 685, 491, 684, 491, 684, 492, 683, 492, 683, 493, 682, 493, 682, 495, 681, 495, 681, 496, 680, 496, 680, 497, 679, 497, 679, 498, 678, 498, 678, 499, 677, 499, 677, 501, 676, 501, 676, 502, 675, 502, 675, 503, 674, 503, 674, 504, 673, 504, 673, 505, 672, 505, 672, 507, 671, 507, 671, 508, 670, 508, 670, 509, 669, 509, 669, 510, 668, 510, 668, 511, 667, 511, 667, 512, 666, 512, 666, 514, 665, 514, 665, 515, 664, 515, 664, 516, 663, 516, 663, 517, 662, 517, 662, 518, 660, 518, 660, 519, 659, 519, 659, 520, 658, 520, 658, 521, 657, 521, 657, 523, 656, 523, 656, 524, 655, 524, 655, 525, 654, 525, 654, 526, 653, 526, 653, 527, 652, 527, 652, 529, 651, 529, 651, 530, 650, 530, 650, 531, 649, 531, 649, 532, 648, 532, 648, 533, 647, 533, 647, 535, 646, 535, 646, 536, 645, 536, 645, 537, 644, 537, 644, 538, 643, 538, 643, 539, 642, 539, 642, 541, 641, 541, 641, 542, 640, 542, 640, 543, 639, 543, 639, 544, 638, 544, 638, 545, 637, 545, 637, 547, 636, 547, 636, 548, 635, 548, 635, 549, 634, 549, 634, 550, 633, 550, 633, 551, 632, 551, 632, 553, 631, 553, 631, 554, 630, 554, 630, 555, 629, 555, 629, 556, 628, 556, 628, 557, 627, 557, 627, 559, 626, 559, 626, 560, 625, 560, 625, 561, 624, 561, 624, 562, 623, 562, 623, 563, 622, 563, 622, 565, 621, 565, 621, 566, 620, 566, 620, 567, 619, 567, 619, 568, 618, 568, 618, 569, 617, 569, 617, 571, 616, 571, 616, 572, 615, 572, 615, 573, 614, 573, 614, 574, 613, 574, 613, 575, 612, 575, 612, 577, 611, 577, 611, 578, 610, 578, 610, 579, 609, 579, 609, 580, 608, 580, 608, 581, 607, 581, 607, 583, 606, 583, 606, 584, 605, 584, 605, 585, 604, 585, 604, 586, 603, 586, 603, 587, 602, 587, 602, 589, 601, 589, 601, 590, 600, 590, 600, 591, 599, 591, 599, 592, 598, 592, 598, 593, 597, 593, 597, 595, 596, 595, 596, 596, 595, 596, 595, 597, 594, 597, 594, 598, 593, 598, 593, 599, 592, 599, 592, 601, 591, 601, 591, 602, 590, 602, 590, 603, 589, 603, 589, 604, 588, 604, 588, 605, 587, 605, 587, 607, 584, 607, 584, 606, 582, 606, 582, 605, 581, 605, 581, 604, 580, 604, 580, 603, 578, 603, 578, 602, 577, 602, 577, 601, 575, 601, 575, 600, 574, 600, 574, 599, 572, 599, 572, 598, 571, 598, 571, 597, 569, 597, 569, 596, 568, 596, 568, 595, 566, 595, 566, 594, 565, 594, 565, 593, 563, 593, 563, 592, 562, 592, 562, 591, 560, 591, 560, 590, 559, 590, 559, 589, 557, 589, 557, 588, 556, 588, 556, 587, 555, 587, 555, 586, 553, 586, 553, 585, 552, 585, 552, 584, 550, 584, 550, 583, 549, 583, 549, 582, 547, 582, 547, 581, 546, 581, 546, 580, 544, 580, 544, 579, 543, 579, 543, 578, 541, 578, 541, 577, 540, 577, 540, 576, 538, 576, 538, 575, 537, 575, 537, 574, 535, 574, 535, 573, 534, 573, 534, 572, 532, 572, 532, 571, 531, 571, 531, 570, 529, 570, 529, 569, 528, 569, 528, 568, 527, 568, 527, 567, 525, 567, 525, 566, 524, 566, 524, 565, 522, 565, 522, 564, 521, 564, 521, 563, 519, 563, 519, 562, 518, 562, 518, 561, 516, 561, 516, 560, 515, 560, 515, 559, 513, 559, 513, 558, 512, 558, 512, 557, 510, 557, 510, 556, 509, 556, 509, 555, 507, 555, 507, 554, 506, 554, 506, 553, 504, 553, 504, 552, 503, 552, 503, 551, 502, 551, 502, 550, 500, 550, 500, 549, 499, 549, 499, 548, 497, 548, 497, 547, 496, 547, 496, 546, 494, 546, 494, 545, 493, 545, 493, 544, 491, 544, 491, 543, 490, 543, 490, 542, 488, 542, 488, 541, 487, 541, 487, 540, 485, 540, 485, 539, 484, 539, 484, 538, 482, 538, 482, 537, 481, 537, 481, 536, 479, 536, 479, 535, 478, 535, 478, 534, 476, 534, 476, 533, 475, 533, 475, 532, 474, 532, 474, 531, 472, 531, 472, 530, 471, 530, 471, 529, 469, 529, 469, 528, 468, 528, 468, 527, 466, 527, 466, 526, 465, 526, 465, 525, 463, 525, 463, 524, 462, 524, 462, 523, 460, 523, 460, 522, 459, 522, 459, 521, 457, 521, 457, 520, 456, 520, 456, 519, 454, 519, 454, 518, 453, 518, 453, 517, 452, 517, 452, 515, 453, 515, 453, 514, 454, 514, 7";
            return content;
        }

        /// <summary>
        /// Gets the zones of the store
        /// </summary>
        /// <returns>Returns an List in which the zones of the store will be stored</returns>
        private static List<List<Position>> getZones()
        {
            List<List<Position>> zones = new List<List<Position>>();
            List<Position> zone;

            string csvContent = getZonesCsvContent();
            string[] lines = csvContent.Split('\n');

            for (int i = 1; i < lines.Length; i++)
            {
                zone = new List<Position>();

                char[] delimiters = { ',', ' ' };
                string[] values = lines[i].Split(delimiters, StringSplitOptions.RemoveEmptyEntries);

                for (int j = 1; j <= int.Parse(values[0]) * 2; j += 2)
                {
                    zone.Add(new Position(int.Parse(values[j]), int.Parse(values[j + 1])));
                }

                zones.Add(zone);
            }

            return zones;
        }

    }
}

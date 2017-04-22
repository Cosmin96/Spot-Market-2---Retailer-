// Made by: Tudor Nica

using System;
using System.Collections;
using System.Collections.Generic;

using Android.Content;
using Android.Util;

using EstimoteSdk;


namespace Spot_Market
{
    /// <summary>
    /// Class used to locate the user on a store's map
    /// </summary>
    /// <remarks>
    /// Constructed over the class FindAllBeacons.cs from the example provided by Xamarin along with EstimoteSdk: https://components.xamarin.com/view/estimotesdkandroid
    /// </remarks>
    class LocateUser : BeaconFinder
    {
        public static readonly Region ALL_ESTIMOTE_BEACONS_REGION = new Region("rid", "B9407F30-F5F8-466E-AFF9-25556B57FE6D");

        static readonly string TAG = typeof(LocateUser).Name;

        // The rate (in miliseconds) at which the phone will search for beacons
        private const int rate = 1000;

        public LocateUser(Context context) : base(context)
        {
            BeaconManager.Ranging += HandleRanging;
            BeaconManager.SetForegroundScanPeriod(rate, 0);
        }

        public override void OnServiceReady()
        {
            BeaconManager.StartRanging(ALL_ESTIMOTE_BEACONS_REGION);
        }

        /// <summary>
        /// Calculates the closest point on a circle from a specific point
        /// </summary>
        /// <param name="p">A point</param>
        /// <param name="c">Circle's center</param>
        /// <param name="r">Circle's radius</param>
        /// <returns>Returns the closest point on the circle with the center c and radius r from the point p</returns>
        /// <seealso cref="Position"/>
        private Position intersectLineWithCircle(Position p, Position c, int r)
        {
            int x = p.getX() + r * (c.getX() - p.getX()) / ((int)Position.getDist2Points(p, c));
            int y = p.getY() + r * (c.getY() - p.getY()) / ((int)Position.getDist2Points(p, c));
            return new Position(x, y);
        }

        /// <summary>
        /// Calculates the closest point to 3 circles
        /// </summary>
        /// <param name="p1">Center of the first circle</param>
        /// <param name="r1">Radius of the first circle</param>
        /// <param name="p2">Center of the second circle</param>
        /// <param name="r2">Radius of the second circle</param>
        /// <param name="p3">Center of the third circle</param>
        /// <param name="r3">Radius of the third circle</param>
        /// <returns>Returns the closest point to 3 circles</returns>
        /// <seealso cref="Position"/>
        private Position closestTo3Circles(Position p1, int r1, Position p2, int r2, Position p3, int r3)
        {
            Position p = new Position((p1.getX() + p2.getX() + p3.getX()) / 3, (p1.getY() + p2.getY() + p3.getY()) / 3);
            Position p1Int = intersectLineWithCircle(p, p1, r1);
            Position p2Int = intersectLineWithCircle(p, p2, r2);
            Position p3Int = intersectLineWithCircle(p, p3, r3);
            p.setCoordinates((p1Int.getX() + p2Int.getX() + p3Int.getX()) / 3, (p1Int.getY() + p2Int.getY() + p3Int.getY()) / 3);

            return p;
        }

        /// <summary>
        /// Calculates the intersection of 3 circles, choosing one of the 2 intersections of 2 circles
        /// </summary>
        /// <remarks>Calculates the 2 intersections of the first 2 circles and then returns the closest one to the third circle</remarks>
        /// <param name="p1">Center of the first circle</param>
        /// <param name="r1">Radius of the first circle</param>
        /// <param name="p2">Center of the second circle</param>
        /// <param name="r2">Radius of the second circle</param>
        /// <param name="p3">Center of the third circle</param>
        /// <param name="r3">Radius of the third circle</param>
        /// <returns>
        /// If the first 2 circles intersect: returns the intersection of the 3 circles
        /// If the first 2 circles don't intersect: returns the point with coordinates 0, 0
        /// </returns>
        /// <seealso cref="Position"/>
        private Position intersect3CirclesDependingOn2(Position p1, int r1, Position p2, int r2, Position p3, int r3)
        {
            int x1 = p1.getX();
            int y1 = p1.getY();
            int x2 = p2.getX();
            int y2 = p2.getY();
            int x3 = p3.getX();
            int y3 = p3.getY();

            double d = Position.getDist2Points(p1, p2);

            if (d > r1 + r2)
            {
                // the first 2 circles don't intersect
                return new Position(0, 0);
            }
            
            // intersection(s) exist

            double l = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
            double h = Math.Sqrt(r1 * r1 - l * l);
            double ix1 = l * (x2 - x1) / d + h * (y2 - y1) / d + x1;
            double ix2 = l * (x2 - x1) / d - h * (y2 - y1) / d + x1;
            double iy1 = l * (y2 - y1) / d - h * (x2 - x1) / d + y1;
            double iy2 = l * (y2 - y1) / d + h * (x2 - x1) / d + y1;

            Position resp1 = new Position((int)ix1, (int)iy1);
            Position resp2 = new Position((int)ix2, (int)iy2);

            if (Math.Abs(r3 - Position.getDist2Points(p3, resp1)) < Math.Abs(r3 - Position.getDist2Points(p3, resp2)))
                return resp1;

            return resp2;
        }

        /// <summary>
        /// Calculates the intersection of 3 circles
        /// </summary>
        /// <param name="p1">Center of the first circle</param>
        /// <param name="r1">Radius of the first circle</param>
        /// <param name="p2">Center of the second circle</param>
        /// <param name="r2">Radius of the second circle</param>
        /// <param name="p3">Center of the third circle</param>
        /// <param name="r3">Radius of the third circle</param>
        /// <returns>Returns the intersection of 3 circles</returns>
        private Position intersect3Circles(Position p1, int r1, Position p2, int r2, Position p3, int r3)
        {
            Position intP1 = intersect3CirclesDependingOn2(p1, r1, p2, r2, p3, r3);
            if (intP1.is0())
            {
                intP1 = closestTo3Circles(p1, r1, p2, r2, p3, r3);
            }

            Position intP2 = intersect3CirclesDependingOn2(p2, r2, p3, r3, p1, r1);
            if (intP2.is0())
            {
                intP2 = closestTo3Circles(p1, r1, p2, r2, p3, r3);
            }

            Position intP3 = intersect3CirclesDependingOn2(p1, r1, p3, r3, p2, r2);
            if (intP3.is0())
            {
                intP3 = closestTo3Circles(p1, r1, p2, r2, p3, r3);
            }

            return new Position((intP1.getX() + intP2.getX() + intP3.getX()) / 3, (intP1.getY() + intP2.getY() + intP3.getY()) / 3);
        }

        /// <summary>
        /// Gets the store's beacons major, minor, X coordinate on store's map, Y coordinate on store's map
        /// </summary>
        /// <param name="mapBeacons">The list in which the beacons will be stored</param>
        /// <param name="ratio">The pixels per meter ratio of the map</param>
        /// <seealso cref="BeaconOnMap"/>
        private void getMapBeaconsAndRatio(ref BeaconOnMap[] mapBeacons, ref int ratio)
        {
            // TODO: properly import beacons' details and ratio from files provided by stores
            ratio = 48;
            mapBeacons[0] = new BeaconOnMap(23896, 25923, 740, 373);
            mapBeacons[1] = new BeaconOnMap(7354, 47683, 131, 331);
            mapBeacons[2] = new BeaconOnMap(58610, 36050, 457, 299);
            mapBeacons[3] = new BeaconOnMap(18155, 58632, 618, 205);
            mapBeacons[4] = new BeaconOnMap(61265, 34052, 474, 153);
            mapBeacons[5] = new BeaconOnMap(36242, 5515, 555, 569);
            mapBeacons[6] = new BeaconOnMap(31499, 2016, 585, 417);
            mapBeacons[7] = new BeaconOnMap(30745, 50948, 152, 85);
        }

        /// <summary>
        /// Gets the closest 3 beacons to the user's phone
        /// </summary>
        /// <param name="b3">The list in which the closest 3 becaons will be stored</param>
        /// <param name="dist">The list in which the distances (map image pixels) to the closest 3 beacons will be stored</param>
        /// <param name="beacons">The list of the beacons detected by the user's phone</param>
        /// <param name="mapBeacons">The list of the beacons in the store</param>
        /// <param name="ratio"></param>
        private void getClosest3BeaconsOnMap(ref BeaconOnMap[] b3, ref int[] dist, IList<Beacon> beacons, BeaconOnMap[] mapBeacons, int ratio)
        {
            int i = 0;

            foreach (Beacon b in beacons)
            {
                for (int j = 0; j < 8; j++)
                    if (mapBeacons[j].getMajor() == b.Major && mapBeacons[j].getMinor() == b.Minor)
                    {
                        b3[i] = mapBeacons[j];
                        dist[i] = (int)(ratio * computeAccuracy(b.Rssi, b.MeasuredPower - b.MeasuredPower/10));
                        i++;
                        break;
                    }
                if (i >= 3)
                    break;
            }
        }

        /// <summary>
        /// Gets the distance between a beacon and the user's phone
        /// </summary>
        /// <remarks>
        /// This function was copied from the EstimoteSdk for Android Studio.
        /// The SDK for Xamarin only has the version of this function that takes the beacon as parameter (not the rssi and the measured power).
        /// The returned distance is not correct, so the actual parameters (rssi and measured power) have to be adjusted in order to "calibrate" the signal.
        /// Note: the displayed distance displayed by the Estimote app is correct, even though the same function is used, so the rssi and measured power "calculation" process in the SDK for Xamarin may be incorrect.
        /// </remarks>
        /// <param name="rssi">Rssi of the beacon</param>
        /// <param name="measuredPower">Measured power of the beacon</param>
        /// <returns>The distance between the beacon and the user's phone</returns>
        private static double computeAccuracy(int rssi, int measuredPower)
        {
            if (rssi == 0)
            {
                return -1.0d;
            }
            double ratio = ((double)rssi) / ((double)measuredPower);
            double rssiCorrection = 0.96d + ((Math.Pow((double)Math.Abs(rssi), 3.0d) % 10.0d) / 150.0d);
            if (ratio <= 1.0d)
            {
                return Math.Pow(ratio, 9.98d) * rssiCorrection;
            }
            return (0.103d + (0.89978d * Math.Pow(ratio, 7.71d))) * rssiCorrection;
        }

        // The number of calculated positions averaged to get the user's location
        // Note: the bigger this number, the better the accuracy of the displayed position, but the bigger the delay between the user's moovement and the display
        private const int maxPosInList = 5;

        // The list with the last maxPosInList calculated positions
        private ArrayList lastPositions = new ArrayList();

        // X and Y total of the last maxPosInList positions
        private int xTotal = 0;
        private int yTotal = 0;
        
        /// <summary>
        /// Method to calculate and to draw the user's location on the map.
        /// </summary>
        /// <param name="sender">Object that calls this method</param>
        /// <param name="e">Beacon manger ranging events</param>
        protected virtual void HandleRanging(object sender, BeaconManager.RangingEventArgs e)
        { 
            if (e.Beacons.Count == 0)
            {
                Log.Debug(TAG, "There are no beacons in range.");
                return;
            }

            Log.Debug(TAG, "Found {0} beacons.", e.Beacons.Count);
            foreach(Beacon b in e.Beacons)
            {
                Log.Debug(TAG, "major: {0}, minor: {1}, distance: {2}", b.Major, b.Minor, computeAccuracy(b.Rssi + b.Rssi/9, b.MeasuredPower));
            }

            if (e.Beacons.Count < 3)
            {
                // We need at least 3 beacons to do the trilateration
                return;
            }

            BeaconOnMap[] mapBeacons = new BeaconOnMap[8];
            int ratio = 0;

            getMapBeaconsAndRatio(ref mapBeacons, ref ratio);

            BeaconOnMap[] b3 = new BeaconOnMap[3];
            int[] dist = new int[3];

            getClosest3BeaconsOnMap(ref b3, ref dist, e.Beacons, mapBeacons, ratio);

            if (b3[0] == null || b3[1] == null || b3[2] == null)
            {
                return;
            }

            Position pos = intersect3Circles(b3[0].getPosition(), dist[0], b3[1].getPosition(), dist[1], b3[2].getPosition(), dist[2]);

            // Calculate the average of the last maxPosInList calculated positions

            xTotal += pos.getX();
            yTotal += pos.getY();
            lastPositions.Add(pos);

            if(lastPositions.Count == maxPosInList)
            {
                xTotal -= ((Position)lastPositions[0]).getX();
                yTotal -= ((Position)lastPositions[0]).getY();
                lastPositions.RemoveAt(0);
            }

            if (pos.getX() > 0 && pos.getY() > 0)
            {
                Map.refreshCanvas();
                Map.drawPointOnMap(xTotal / lastPositions.Count, yTotal / lastPositions.Count, "purple");
            }
        }

        public void FindBeacons(Context context)
        {
            //TODO: Properly detect BT Enabled
            var btEnabled = true;
            if (!btEnabled)
            {
                throw new Exception("Bluetooth is not enabled.");
            }
            BeaconManager.Connect(this);

        }

        public override void Stop()
        {
            BeaconManager.StopRanging(ALL_ESTIMOTE_BEACONS_REGION);

            base.Stop();
        }
    }
}

// Made by: Tudor Nica

namespace Spot_Market
{
    /// <summary>
    /// Class for representing the beacons placed by retailers in their stores
    /// </summary>
    class BeaconOnMap
    {
        Position pos;
        private int major;
        private int minor;

        /// <summary>
        /// Constructor of BeaconOnMap class
        /// </summary>
        /// <param name="major">Beacon's major</param>
        /// <param name="minor">Beacon's minor</param>
        /// <param name="xPos">Beacon's X coordinate</param>
        /// <param name="yPos">Beacon's Y coordinate</param>
        public BeaconOnMap(int major, int minor, int xPos, int yPos)
        {
            this.major = major;
            this.minor = minor;
            pos = new Position(xPos, yPos);
        }

        /// <summary>
        /// Constructor of BeaconOnMap class
        /// </summary>
        /// <param name="major">Beacon's major</param>
        /// <param name="minor">Beacon's minor</param>
        /// <param name="position">Beacon's position</param>
        public BeaconOnMap(int major, int minor, Position position)
        {
            this.major = major;
            this.minor = minor;
            this.pos = position;
        }

        /// <summary>
        /// Gets the major of this beacon
        /// </summary>
        /// <returns>Returns the major of this beacon</returns>
        public int getMajor()
        {
            return major;
        }

        /// <summary>
        /// Gets the minor of this beacon
        /// </summary>
        /// <returns>Returns the minor of this beacon</returns>
        public int getMinor()
        {
            return minor;
        }

        /// <summary>
        /// Gets the position of this beacon
        /// </summary>
        /// <returns>Returns the position of this beacon</returns>
        /// <seealso cref="Position"/>
        public Position getPosition()
        {
            return pos;
        }

        /// <summary>
        /// Gets the string representation of a BeaconOnMap instance in the format: major, minor, position (x, y)
        /// </summary>
        /// <returns>Returns the string representation of a BeaconOnMap instance</returns>
        public override string ToString()
        {
            return "major: " + major.ToString() + ", minor:" + minor.ToString() + ", position: " + pos.getX().ToString() + ", " + pos.getY().ToString() + "; ";
        }
    }
}
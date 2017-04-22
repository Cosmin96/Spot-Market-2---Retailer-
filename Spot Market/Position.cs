// Made by: Tudor Nica

using System;

namespace Spot_Market
{
    /// <summary>
    /// Class for representing the points on a 2 dimentional plan
    /// </summary>
    class Position
    {
        private int xPos;
        private int yPos;

        /// <summary>
        /// Constructor of Position class
        /// </summary>
        public Position()
        {
            xPos = 0;
            yPos = 0;
        }

        /// <summary>
        /// Constructor of Position class
        /// </summary>
        /// <param name="xPos">X coordinate of the position</param>
        /// <param name="yPos">Y coordinate of the position</param>
        public Position(int xPos, int yPos)
        {
            this.xPos = xPos;
            this.yPos = yPos;
        }

        /// <summary>
        /// Set the coordinates of a Position object
        /// </summary>
        /// <param name="xPos">New X coordinate</param>
        /// <param name="yPos">New Y coordinate</param>
        public void setCoordinates(int xPos, int yPos)
        {
            this.xPos = xPos;
            this.yPos = yPos;
        }
        
        /// <summary>
        /// Set the X coordinate of this position
        /// </summary>
        /// <param name="xPos">New X coordinate</param>
        public void setX(int xPos)
        {
            this.xPos = xPos;
        }

        /// <summary>
        /// Set the Y coordinate of this position
        /// </summary>
        /// <param name="yPos">New Y coordinate</param>
        public void setY(int yPos)
        {
            this.yPos = yPos;
        }

        /// <summary>
        /// Get the X coordinate of this position
        /// </summary>
        /// <returns>Returns the X coordinate of this position</returns>
        public int getX()
        {
            return xPos;
        }

        /// <summary>
        /// Get the Y coordinate of this position
        /// </summary>
        /// <returns>Returns the Y coordinate of this position</returns>
        public int getY()
        {
            return yPos;
        }

        /// <summary>
        /// Checks wheter this position's coordinates are both 0
        /// </summary>
        /// <returns>Returns true if both coordinates of this position are 0 and false otherwise</returns>
        public bool is0()
        {
            return xPos == 0 && yPos == 0;
        }

        /// <summary>
        /// Checks if 2 points have the same coordinates
        /// </summary>
        /// <param name="p1">First position</param>
        /// <param name="p2">Second position</param>
        /// <returns>Returns true if the points have equal coordinates and false otherwise</returns>
        public static bool equal(Position p1, Position p2)
        {
            if (p1.getX() == p2.getX() && p1.getY() == p2.getY())
                return true;
            return false;
        }

        /// <summary>
        /// Gets the distance between 2 points
        /// </summary>
        /// <param name="p1">First position</param>
        /// <param name="p2">Second position</param>
        /// <returns>Returns the distance between the 2 positions</returns>
        public static double getDist2Points(Position p1, Position p2)
        {
            return Math.Sqrt((p1.getX() - p2.getX()) * (p1.getX() - p2.getX()) + (p1.getY() - p2.getY()) * (p1.getY() - p2.getY()));
        }

        /// <summary>
        /// Gets the string representation of this position in the following format: major, minor, position (x, y)
        /// </summary>
        /// <returns>Returns the string representation of this position</returns>
        override public string ToString()
        {
            return "x: " + xPos.ToString() + ", y: " + yPos.ToString();
        }
    }
}
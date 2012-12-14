var geoTools = new function () {
    function DegtoRad(x) {
        return x * Math.PI / 180;
    }

    function RadtoDeg(x) {
        return x * 180 / Math.PI;
    }

    this.Constants = {
        EARTH_RADIUS_METERS: 6378100,
        EARTH_RADIUS_KM: 6378.1,
        EARTH_RADIUS_MILES: 3963.1676,
        EARTH_RADIUS_FEET: 20925524.9
    };

    this.CalculateCoord = function (origin, brng, arcLength, earthRadius) {
        var lat1 = DegtoRad(origin.latitude),
            lon1 = DegtoRad(origin.longitude),
            centralAngle = arcLength / earthRadius;

        var lat2 = Math.asin(Math.sin(lat1) * Math.cos(centralAngle) + Math.cos(lat1) * Math.sin(centralAngle) * Math.cos(DegtoRad(brng)));
        var lon2 = lon1 + Math.atan2(Math.sin(DegtoRad(brng)) * Math.sin(centralAngle) * Math.cos(lat1), Math.cos(centralAngle) - Math.sin(lat1) * Math.sin(lat2));

        return new Microsoft.Maps.Location(RadtoDeg(lat2), RadtoDeg(lon2));
    };

    this.GenerateRegularPolygon = function (centerPoint, radius, earthRadius, numberOfPoints, offset) {
        var points = [],
            centralAngle = 360 / numberOfPoints;

        for (var i = 0; i <= numberOfPoints; i++) {
            points.push(geoTools.CalculateCoord(centerPoint, (i * centralAngle + offset) % 360, radius, earthRadius));
        }

        return points;
    };

    this.HaversineDistance = function (coord1, coord2, earthRadius) {
        var lat1 = DegtoRad(coord1.latitude),
            lon1 = DegtoRad(coord1.longitude),
            lat2 = DegtoRad(coord2.latitude),
            lon2 = DegtoRad(coord2.longitude);

        var dLat = lat2 - lat1,
            dLon = lon2 - lon1,
            cordLength = Math.pow(Math.sin(dLat / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dLon / 2), 2),
            centralAngle = 2 * Math.atan2(Math.sqrt(cordLength), Math.sqrt(1 - cordLength));

        return earthRadius * centralAngle;
    };
};
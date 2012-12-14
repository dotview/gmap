
function OGBLatLng(lat, lon)
{
	this.lat = lat;
	this.lon = lon;
}

function WGS84LatLng(lat, lon)
{
	this.lat = lat;
	this.lon = lon;
}

function OGBNorthEast(east, north)
{
	this.north = north;
	this.east = east;
}

function OGBRect(bottomLeft, topRight)
{
	this.bl = bottomLeft;
	this.tr = topRight;
}



//convert WGS84 Latitude and Longitude to Ordnance Survey 1936 Latitude Longitude

function WGS84ToOGB(WGlat, WGlon, height)
{
var deg2rad = Math.PI / 180;
var rad2deg = 180.0 / Math.PI;

//first off convert to radians
var radWGlat = WGlat * deg2rad;
var radWGlon = WGlon * deg2rad;
//these are the values for WGS84(GRS80) to OSGB36(Airy)
var a = 6378137; // WGS84_AXIS
var e = 0.00669438037928458; // WGS84_ECCENTRIC
var h = height; // height above datum (from $GPGGA sentence)
var a2 = 6377563.396; // OSGB_AXIS
var e2 = 0.0066705397616; // OSGB_ECCENTRIC 
var xp = -446.448;
var yp = 125.157;
var zp = -542.06;
var xr = -0.1502;
var yr = -0.247;
var zr = -0.8421;
var s = 20.4894;

// convert to cartesian; lat, lon are in radians
var sf = s * 0.000001;
var v = a / (Math.sqrt(1 - (e * (Math.sin(radWGlat) * Math.sin(radWGlat)))));
var x = (v + h) * Math.cos(radWGlat) * Math.cos(radWGlon);
var y = (v + h) * Math.cos(radWGlat) * Math.sin(radWGlon);
var z = ((1 - e) * v + h) * Math.sin(radWGlat);

// transform cartesian
var xrot = (xr / 3600) * deg2rad;
var yrot = (yr / 3600) * deg2rad;
var zrot = (zr / 3600) * deg2rad;
var hx = x + (x * sf) - (y * zrot) + (z * yrot) + xp;
var hy = (x * zrot) + y + (y * sf) - (z * xrot) + yp;
var hz = (-1 * x * yrot) + (y * xrot) + z + (z * sf) + zp;

// Convert back to lat, lon
var newLon = Math.atan(hy / hx);
var p = Math.sqrt((hx * hx) + (hy * hy));
var newLat = Math.atan(hz / (p * (1 - e2)));
v = a2 / (Math.sqrt(1 - e2 * (Math.sin(newLat) * Math.sin(newLat))));
var errvalue = 1.0;
var lat0 = 0;
while (errvalue > 0.001)
{
lat0 = Math.atan((hz + e2 * v * Math.sin(newLat)) / p);
errvalue = Math.abs(lat0 - newLat);
newLat = lat0;
}

//convert back to degrees
newLat = newLat * rad2deg;
newLon = newLon * rad2deg;

return new OGBLatLng(newLat, newLon);

}


//convert Ordnance Survey 1936 Latitude Longitude to WGS84 Latitude and Longitude

function OGBToWGS84(OGlat, OGlon, height)
{
var deg2rad = Math.PI / 180;
var rad2deg = 180.0 / Math.PI;

//first off convert to radians
var radOGlat = OGlat * deg2rad;
var radOGlon = OGlon * deg2rad;
//these are the values for WGS84(GRS80) to OSGB36(Airy)

var a2 = 6378137; // WGS84_AXIS
var e2 = 0.00669438037928458; // WGS84_ECCENTRIC

var h = height; // height above datum (from $GPGGA sentence)

var a = 6377563.396; // OSGB_AXIS
var e = 0.0066705397616; // OSGB_ECCENTRIC 

var xp = 446.448;
var yp = -125.157;
var zp = 542.06;
var xr = 0.1502;
var yr = 0.247;
var zr = 0.8421;

var s = -20.4894;

// convert to cartesian; lat, lon are in radians
var sf = s * 0.000001;
var v = a / (Math.sqrt(1 - (e * (Math.sin(radOGlat) * Math.sin(radOGlat)))));
var x = (v + h) * Math.cos(radOGlat) * Math.cos(radOGlon);
var y = (v + h) * Math.cos(radOGlat) * Math.sin(radOGlon);
var z = ((1 - e) * v + h) * Math.sin(radOGlat);

// transform cartesian
var xrot = (xr / 3600) * deg2rad;
var yrot = (yr / 3600) * deg2rad;
var zrot = (zr / 3600) * deg2rad;
var hx = x + (x * sf) - (y * zrot) + (z * yrot) + xp;
var hy = (x * zrot) + y + (y * sf) - (z * xrot) + yp;
var hz = (-1 * x * yrot) + (y * xrot) + z + (z * sf) + zp;

// Convert back to lat, lon
var newLon = Math.atan(hy / hx);
var p = Math.sqrt((hx * hx) + (hy * hy));
var newLat = Math.atan(hz / (p * (1 - e2)));
v = a2 / (Math.sqrt(1 - e2 * (Math.sin(newLat) * Math.sin(newLat))));
var errvalue = 1.0;
var lat0 = 0;
while (errvalue > 0.001)
{
lat0 = Math.atan((hz + e2 * v * Math.sin(newLat)) / p);
errvalue = Math.abs(lat0 - newLat);
newLat = lat0;
}

//convert back to degrees
newLat = newLat * rad2deg;
newLon = newLon * rad2deg;

return new WGS84LatLng(newLat, newLon);

}


//converts lat and lon (OSGB36) to OS northings and eastings
function LLtoNE(lat, lon)
{
var deg2rad = Math.PI / 180;
var rad2deg = 180.0 / Math.PI;

var phi = lat * deg2rad; // convert latitude to radians
var lam = lon * deg2rad; // convert longitude to radians
var a = 6377563.396; // OSGB semi-major axis
var b = 6356256.91; // OSGB semi-minor axis
var e0 = 400000; // easting of false origin
var n0 = -100000; // northing of false origin
var f0 = 0.9996012717; // OSGB scale factor on central meridian
var e2 = 0.0066705397616; // OSGB eccentricity squared
var lam0 = -0.034906585039886591; // OSGB false east
var phi0 = 0.85521133347722145; // OSGB false north
var af0 = a * f0;
var bf0 = b * f0;

// easting
var slat2 = Math.sin(phi) * Math.sin(phi);
var nu = af0 / (Math.sqrt(1 - (e2 * (slat2))));
var rho = (nu * (1 - e2)) / (1 - (e2 * slat2));
var eta2 = (nu / rho) - 1;
var p = lam - lam0;
var IV = nu * Math.cos(phi);
var clat3 = Math.pow(Math.cos(phi), 3);
var tlat2 = Math.tan(phi) * Math.tan(phi);
var V = (nu / 6) * clat3 * ((nu / rho) - tlat2);
var clat5 = Math.pow(Math.cos(phi), 5);
var tlat4 = Math.pow(Math.tan(phi), 4);
var VI = (nu / 120) * clat5 * ((5 - (18 * tlat2)) + tlat4 + (14 * eta2) - (58 * tlat2 * eta2));
var east = e0 + (p * IV) + (Math.pow(p, 3) * V) + (Math.pow(p, 5) * VI);

// northing
var n = (af0 - bf0) / (af0 + bf0);
var M = Marc(bf0, n, phi0, phi);
var I = M + (n0);
var II = (nu / 2) * Math.sin(phi) * Math.cos(phi);
var III = ((nu / 24) * Math.sin(phi) * Math.pow(Math.cos(phi), 3)) * (5 - Math.pow(Math.tan(phi), 2) + (9 * eta2));
var IIIA = ((nu / 720) * Math.sin(phi) * clat5) * (61 - (58 * tlat2) + tlat4);
var north = I + ((p * p) * II) + (Math.pow(p, 4) * III) + (Math.pow(p, 6) * IIIA);

// make whole number values
east = Math.round(east); // round to whole number of meters
north = Math.round(north); 

return new OGBNorthEast(east, north);
}


//convert northing and easting to letter and number grid system
function NE2NGR( east,  north)
{
east = Math.round(east);
north = Math.round(north);
var eX = east / 500000;
var nX = north / 500000;
var tmp = Math.floor(eX) - 5.0 * Math.floor(nX) + 17.0; 
nX = 5 * (nX - Math.floor(nX));
eX = 20 - 5.0 * Math.floor(nX) + Math.floor(5.0 * (eX - Math.floor(eX)));
if (eX > 7.5) eX = eX + 1; // I is not used
if (tmp > 7.5) tmp = tmp + 1; // I is not used

var eing = east - (Math.floor(east / 100000)*100000);
var ning = north - (Math.floor(north / 100000)*100000);
var estr = eing.toString();
var nstr = ning.toString();
while(estr.length < 5)
	estr = "0" + estr;
while(nstr.length < 5)
	nstr = "0" + nstr;

var ngr = String.fromCharCode(tmp + 65) + 
          String.fromCharCode(eX + 65) + 
          " " + estr + " " + nstr;

return ngr;
}

//helper
function Marc( bf0,  n,  phi0,  phi)
{
return bf0 * (((1 + n + ((5 / 4) * (n * n)) + ((5 / 4) * (n * n * n))) * (phi - phi0))
- (((3 * n) + (3 * (n * n)) + ((21 / 8) * (n * n * n))) * (Math.sin(phi - phi0)) * (Math.cos(phi + phi0)))
+ ((((15 / 8) * (n * n)) + ((15 / 8) * (n * n * n))) * (Math.sin(2 * (phi - phi0))) * (Math.cos(2 * (phi + phi0))))
- (((35 / 24) * (n * n * n)) * (Math.sin(3 * (phi - phi0))) * (Math.cos(3 * (phi + phi0)))));
}

function NEtoLL (east, north){
 
//metres in, degrees out

var K0 = 0.9996012717; // grid scale factor on central meridean
var OriginLat = 49.0;
var OriginLong = -2.0;    
var OriginX = 400000; // 400 kM
var OriginY = -100000; // 100 kM
var a = 6377563.396; // Airy Spheroid
var b = 6356256.910;

var 	e2;
var 	ex;
var 	n1;
var 	n2;
var 	n3;
var 	OriginNorthings;


// compute interim values
a = a * K0;
b = b * K0;
                
n1 = (a - b)/(a + b);
n2 = n1 * n1;
n3 = n2 * n1;   
                                                                                
lat = OriginLat * Math.PI / 180.0; // to radians                                                    
                

e2 = (a*a - b*b)/(a*a);  // first eccentricity
ex = (a*a - b*b)/(b*b);  // second eccentricity


OriginNorthings = b*lat + b*(n1*(1.0 + 5.0*n1*(1.0+n1)/4.0)*lat         
					- 3.0*n1*(1.0+n1*(1.0+7.0*n1/8.0))*Math.sin(lat)*Math.cos(lat)
					+ (15.0*n1*(n1+n2)/8.0)*Math.sin(2.0*lat)*Math.cos(2.0*lat)
					- (35.0*n3/24.0)*Math.sin(3.0*lat)*Math.cos(3.0*lat) );
	
var OriginLat = 49.0;
var OriginLong = -2.0;    
var OriginX = 400000; // 400 kM
var OriginY = -100000; // 100 kM


var lat;    // what we calculate
var lon;

var northing = north - OriginY; 
var easting = east - OriginX;

var nu, phid, phid2, t2, t, q2, c, s, nphid, dnphid; // temps
var nu2, nudivrho, invnurho, rho, eta2;


/* Evaluate M term: latitude of the northing on the centre meridian */  

northing += OriginNorthings;  
           
phid = northing / (b*(1.0 + n1 + 5.0*(n2+n3)/4.0)) - 1.0;
phid2 = phid + 1.0;                                

while (Math.abs(phid2 - phid) > 1E-6)
   {
   phid = phid2;
   nphid = b*phid + b*(n1*(1.0 + 5.0*n1*(1.0+n1)/4.0)*phid
           - 3.0*n1*(1.0+n1*(1.0+7.0*n1/8.0))*Math.sin(phid)*Math.cos(phid)
           + (15.0*n1*(n1+n2)/8.0)*Math.sin(2.0*phid)*Math.cos(2.0*phid)
           - (35.0*n3/24.0)*Math.sin(3.0*phid)*Math.cos(3.0*phid) );
           
   dnphid = b*((1.0+n1+5.0*(n2+n3)/4.0)-3.0*(n1+n2+7.0*n3/8.0)*Math.cos(2.0*phid)
            +(15.0*(n2+n3)/4.0)*Math.cos(4*phid)-(35.0*n3/8.0)*Math.cos(6.0*phid));
           
   phid2 = phid - (nphid - northing)/dnphid;
   }

c  = Math.cos(phid);
s  = Math.sin(phid);
t  = Math.tan(phid);
t2 = t*t;
q2 = easting*easting;


nu2 = (a*a)/(1.0 - e2*s*s);
nu = Math.sqrt(nu2);

nudivrho = a*a*c*c/(b*b) - c*c + 1.0;

eta2 = nudivrho - 1;

rho = nu / nudivrho;

invnurho = ((1.0-e2*s*s)*(1.0-e2*s*s))/(a*a*(1.0-e2));

lat = phid - t*q2*invnurho/2.0 + (q2*q2*(t/(24*rho*nu2*nu)*(5 + (3*t2) + eta2 -(9*t2*eta2))));

lon = (easting/(c*nu))
        - (easting*q2*((nudivrho+2.0*t2)/(6.0*nu2))/(c*nu))
		+ (q2*q2*easting*(5 + (28*t2) + (24*t2*t2))/(120*nu2*nu2*nu*c));
		
return new OGBLatLng(lat * 180.0 / Math.PI,(lon * 180.0 / Math.PI) + OriginLong);        

}

//return rect in OSGB N/E coords that encloses the given wgs84 rect
function enclosingOsgbRect(WGleft,WGbottom,WGtop,WGright){

	var blOGB = WGS84ToOGB(WGbottom,WGleft,0);
	var trOGB = WGS84ToOGB(WGtop,WGright,0);
	var brOGB = WGS84ToOGB(WGbottom,WGright,0);
	var tlOGB = WGS84ToOGB(WGtop,WGleft,0);
	
	var blEN = LLtoNE(blOGB.lat,blOGB.lon);
	var trEN = LLtoNE(trOGB.lat,trOGB.lon);
	var brEN = LLtoNE(brOGB.lat,brOGB.lon);
	var tlEN = LLtoNE(tlOGB.lat,tlOGB.lon);
	
	var e = Math.min(blEN.east,tlEN.east); 
	var w = Math.max(brEN.east,trEN.east); 
	var s = Math.min(blEN.north,brEN.north); 
	var n = Math.max(trEN.north,tlEN.north); 
	
	return new OGBRect(new OGBNorthEast(e,s),new OGBNorthEast(w,n));
}

//difference between grid and true north at a point
function OsgbConvergence(lat,lon)
{

var K0 = 0.9996012717; // grid scale factor on central meridean
var a = 6377563.396; // Airy Spheroid
var b = 6356256.910;
var oDeg = -2.0;//longitude origin
a = a * K0;
b = b * K0;

/* Compute convergence, OS Geodetic Information Paper No 1 */
var phi = lat * Math.PI / 180.0;
var c = Math.cos(phi);
var s = Math.sin(phi);
var t = Math.tan(phi);
var t2 = t*t;
var p = (lon - oDeg) * Math.PI / 180.0;
var eta2 = a*a*c*c/(b*b) - c*c;

return (
( p*s ) +
( p*p*p * s*c*c * (1.0 + (3.0*eta2) + (2.0*eta2*eta2)) / 3.0 ) +
( p*p*p*p*p * s*c*c*c*c * (2.0 - t2) / 15.0 )
)
* 180.0 / Math.PI;

} 

// UK Grid to east+north
function NGR2NE(ngr){
var e;
var n;

ngr = ngr.toUpperCase(ngr);

var bits = ngr.split(' ');
ngr = "";
for(var i=0;i<bits.length;i++)
    ngr+=bits[i];

var c = ngr.charAt(0);
if (c =='S'){ 
    e = 0;
    n = 0;
    }
else if (c == 'T'){
    e = 500000;
    n = 0;
    }
else if (c == 'N'){ 
    n = 500000;
    e = 0;
    }
else if (c == 'O'){
    n = 500000;
    e = 500000;
    }
else if(c == 'H'){
    n = 1000000;
    e = 0;
    }
else 
    return null;
    
c = ngr.charAt(1);
if(c == 'I')
    return null;
    
c = ngr.charCodeAt(1) - 65;
if(c > 8)
    c -= 1;
e += (c % 5) * 100000;
n += (4 - Math.floor(c/5)) * 100000;

c = ngr.substr(2);
if ((c.length%2) == 1) 
    return null;
if (c.length > 10) 
    return null;

try{
    var s = c.substr(0,c.length/2);
    while(s.length < 5)
        s += '0';
    e += parseInt(s,10); 
    if(isNaN(e))
        return null; 
    
    s = c.substr(c.length/2);
    while(s.length < 5)
        s += '0';
    n += parseInt(s,10); 
    if(isNaN(n))
        return null;
        
    return new OGBNorthEast(e,n);
    }
catch (ex)
{
    return null;
}

}
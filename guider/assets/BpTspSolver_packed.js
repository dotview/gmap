/*
  This encapsulates reusable functionality for resolving TSP problems on
  Google Maps.
  The authors of this code are James Tolley <info [at] gmaptools.com>
  and Geir K. Engdahl <geir.engdahl (at) gmail.com>

  For the most up-to-date version of this file, see
  http://code.google.com/p/google-maps-tsp-solver/

  To receive updates, subscribe to google-maps-tsp-solver@googlegroups.com

  version 1.0; 05/07/10

  // Usage:
  See http://code.google.com/p/google-maps-tsp-solver/
*/

(function() {
    var G;
    var H;
    var I;
    var J;
    var K;
    var L;
    var M = 100;
    var N = 0;
    var O = 15;
    var P = 10;
    var Q = 2000000000;
    var R = false;
    var S = google.maps.DirectionsTravelMode.DRIVING;
    var T;
    var U = new Array();
    U[google.maps.GeocoderStatus.OK] = "Success.";
    U[google.maps.GeocoderStatus.INVALID_REQUEST] = "Request was invalid.";
    U[google.maps.GeocoderStatus.ERROR] = "There was a problem contacting the Google servers.";
    U[google.maps.GeocoderStatus.OVER_QUERY_LIMIT] = "The webpage has gone over the requests limit in too short a period of time.";
    U[google.maps.GeocoderStatus.REQUEST_DENIED] = "The webpage is not allowed to use the geocoder.";
    U[google.maps.GeocoderStatus.UNKNOWN_ERROR] = "A geocoding request could not be processed due to a server error. The request may succeed if you try again.";
    U[google.maps.GeocoderStatus.ZERO_RESULTS] = "No result was found for this GeocoderRequest.";
    var V = new Array();
    V[google.maps.DirectionsStatus.INVALID_REQUEST] = "The DirectionsRequest provided was invalid.";
    V[google.maps.DirectionsStatus.MAX_WAYPOINTS_EXCEEDED] = "Too many DirectionsWaypoints were provided in the DirectionsRequest. The total allowed waypoints is 8, plus the origin and destination.";
    V[google.maps.DirectionsStatus.NOT_FOUND] = "At least one of the origin, destination, or waypoints could not be geocoded.";
    V[google.maps.DirectionsStatus.OK] = "The response contains a valid DirectionsResult.";
    V[google.maps.DirectionsStatus.OVER_QUERY_LIMIT] = "The webpage has gone over the requests limit in too short a period of time.";
    V[google.maps.DirectionsStatus.REQUEST_DENIED] = "The webpage is not allowed to use the directions service.";
    V[google.maps.DirectionsStatus.UNKNOWN_ERROR] = "A directions request could not be processed due to a server error. The request may succeed if you try again.";
    V[google.maps.DirectionsStatus.ZERO_RESULTS] = "No route could be found between the origin and destination.";
    var W = new Array();
    var X = new Array();
    var Y = new Array();
    var Z = new Array();
    var ba = new Array();
    var bb = 0;
    var bc = false;
    var bd = 0;
    var be = 0;
    var bf;
    var bg;
    var bh;
    var bi;
    var bj;
    var bk;
    var bl;
    var bm;
    var bn;
    var bo;
    var bp;
    var bq;
    var br;
    var bs;
    var bt = 0;
    var bu = 0;
    var bv = false;
    var bw = function() {};
    var bx = null;
    var by = null;
    var bz = function(a, b) {
        alert("Request failed: " + b)
    }
    var bA = bz;
    var bB = false;
    var bC = null;
    var bD = null;
    function tspAntColonyK2(a) {
        var b = 1.0;
        var c = 1.0;
        var d = 0.1;
        var e = 0.9;
        var f = new Array();
        var g = new Array();
        var h = new Array();
        var l = 20;
        var m = 20;
        for (var i = 0; i < br; ++i) {
            f[i] = new Array();
            g[i] = new Array()
        }
        for (var i = 0; i < br; ++i) {
            for (var j = 0; j < br; ++j) {
                f[i][j] = 1;
                g[i][j] = 0.0
            }
        }
        var n = 0;
        var o = 0;
        var p = br - 1;
        var q = br;
        if (a == 1) {
            n = br - 1;
            p = br - 2;
            q = br - 1
        }
        for (var r = 0; r < m; ++r) {
            for (var s = 0; s < l; ++s) {
                var t = o;
                var u = 0;
                for (var i = 0; i < br; ++i) {
                    bm[i] = false
                }
                bn[0] = t;
                for (var v = 0; v < p; ++v) {
                    bm[t] = true;
                    var w = 0.0;
                    for (var x = 1; x < q; ++x) {
                        if (!bm[x]) {
                            h[x] = Math.pow(f[t][x], b) * Math.pow(bl[t][x], 0.0 - c);
                            w += h[x]
                        }
                    }
                    var y = Math.random() * w;
                    var z = -1;
                    for (var x = 1; x < q; ++x) {
                        if (!bm[x]) {
                            z = x;
                            y -= h[x];
                            if (y < 0) {
                                z = x;
                                break
                            }
                        }
                    }
                    u += bl[t][z];
                    bn[v + 1] = z;
                    t = z
                }
                bn[p + 1] = n;
                u += bl[t][n];
                var A = br;
                if (a == 1) {
                    A = br - 1
                }
                var B = true;
                var i = 0;
                while (B) {
                    B = false;
                    for (; i < A - 2 && !B; ++i) {
                        var C = bl[bn[i + 1]][bn[i + 2]];
                        var D = bl[bn[i + 2]][bn[i + 1]];
                        var E = bl[bn[i]][bn[i + 1]];
                        var F,
                        nowCost,
                        newCost;
                        for (var j = i + 2; j < A && !B; ++j) {
                            nowCost = C + E + bl[bn[j]][bn[j + 1]];
                            newCost = D + bl[bn[i]][bn[j]] + bl[bn[i + 1]][bn[j + 1]];
                            if (nowCost > newCost) {
                                u += newCost - nowCost;
                                for (var k = 0; k < Math.floor((j - i) / 2); ++k) {
                                    F = bn[i + 1 + k];
                                    bn[i + 1 + k] = bn[j - k];
                                    bn[j - k] = F
                                }
                                B = true; --i
                            }
                            C += bl[bn[j]][bn[j + 1]];
                            D += bl[bn[j + 1]][bn[j]]
                        }
                    }
                }
                if (u < bp) {
                    bo = bn;
                    bp = u
                }
                for (var i = 0; i <= p; ++i) {
                    g[bn[i]][bn[i + 1]] += (bp - e * bp) / (l * (u - e * bp))
                }
            }
            for (var i = 0; i < br; ++i) {
                for (var j = 0; j < br; ++j) {
                    f[i][j] = f[i][j] * (1.0 - d) + d * g[i][j];
                    g[i][j] = 0.0
                }
            }
        }
    }
    function tspBruteForce(a, b, c, d) {
        var e = br;
        var f = 0;
        var g = br;
        if (a == 1) {
            e = br - 1;
            f = br - 1;
            g = br - 1
        }
        if (c + bl[b][f] < bp) {
            if (d == e) {
                c += bl[b][f];
                bn[d] = f;
                bp = c;
                for (var i = 0; i <= e; ++i) {
                    bo[i] = bn[i]
                }
            } else {
                for (var i = 1; i < g; ++i) {
                    if (!bm[i]) {
                        bm[i] = true;
                        bn[d] = i;
                        tspBruteForce(a, i, c + bl[b][i], d + 1);
                        bm[i] = false
                    }
                }
            }
        }
    }
    function nextSetOf(a) {
        var b = 0;
        var c = 0;
        for (var i = 0; i < br; ++i) {
            b += bq[i]
        }
        if (b < a) {
            for (var i = 0; i < a; ++i) {
                bq[i] = 1
            }
            for (var i = a; i < br; ++i) {
                bq[i] = 0
            }
        } else {
            var d = -1;
            for (var i = 0; i < br; ++i) {
                if (bq[i]) {
                    d = i;
                    break
                }
            }
            var e = -1;
            for (var i = d + 1; i < br; ++i) {
                if (!bq[i]) {
                    e = i;
                    break
                }
            }
            if (e < 0) {
                return - 1
            }
            bq[e] = 1;
            for (var i = 0; i < e - d - 1; ++i) {
                bq[i] = 1
            }
            for (var i = e - d - 1; i < e; ++i) {
                bq[i] = 0
            }
        }
        for (var i = 0; i < br; ++i) {
            c += (bq[i] << i)
        }
        return c
    }
    function tspDynamic(a) {
        var b = 1 << br;
        var C = new Array();
        var c = new Array();
        for (var i = 0; i < b; ++i) {
            C[i] = new Array();
            c[i] = new Array();
            for (var j = 0; j < br; ++j) {
                C[i][j] = 0.0;
                c[i][j] = 0
            }
        }
        for (var k = 1; k < br; ++k) {
            var d = 1 + (1 << k);
            C[d][k] = bl[0][k]
        }
        for (var s = 3; s <= br; ++s) {
            for (var i = 0; i < br; ++i) {
                bq[i] = 0
            }
            var d = nextSetOf(s);
            while (d >= 0) {
                for (var k = 1; k < br; ++k) {
                    if (bq[k]) {
                        var e = d - (1 << k);
                        C[d][k] = Q;
                        for (var m = 1; m < br; ++m) {
                            if (bq[m] && m != k) {
                                if (C[e][m] + bl[m][k] < C[d][k]) {
                                    C[d][k] = C[e][m] + bl[m][k];
                                    c[d][k] = m
                                }
                            }
                        }
                    }
                }
                d = nextSetOf(s)
            }
        }
        for (var i = 0; i < br; ++i) {
            bo[i] = 0
        }
        var d = (1 << br) - 1;
        if (a == 0) {
            var f = -1;
            bo[br] = 0;
            for (var i = 1; i < br; ++i) {
                if (C[d][i] + bl[i][0] < bp) {
                    bp = C[d][i] + bl[i][0];
                    f = i
                }
            }
            bo[br - 1] = f
        } else {
            var f = br - 1;
            bo[br - 1] = br - 1;
            bp = C[d][br - 1]
        }
        for (var i = br - 1; i > 0; --i) {
            f = c[d][f];
            d -= (1 << bo[i]);
            bo[i - 1] = f
        }
    }
    function makeLatLng(a) {
        return (a.toString().substr(1, a.toString().length - 2))
    }
    function makeDirWp(a) {
        return ({
            location: a,
            stopover: true
        })
    }
    function getWayArr(a) {
        var b = -1;
        for (var i = a + 1; i < W.length; ++i) {
            if (ba[i]) {
                if (b == -1) {
                    b = i
                } else {
                    bf.push(makeDirWp(W[i]));
                    bf.push(makeDirWp(W[a]))
                }
            }
        }
        if (b != -1) {
            bf.push(makeDirWp(W[b]));
            getWayArr(b);
            bf.push(makeDirWp(W[a]))
        }
    }
    function getDistTable(a, b) {
        var c = -1;
        var d = b;
        for (var i = a + 1; i < W.length; ++i) {
            if (ba[i]) {
                d++;
                if (c == -1) {
                    c = i
                } else {
                    bj[b][d] = bg[T];
                    bk[b][d] = bh[T];
                    bl[b][d] = bi[T++];
                    bj[d][b] = bg[T];
                    bk[d][b] = bh[T];
                    bl[d][b] = bi[T++]
                }
            }
        }
        if (c != -1) {
            bj[b][b + 1] = bg[T];
            bk[b][b + 1] = bh[T];
            bl[b][b + 1] = bi[T++];
            getDistTable(c, b + 1);
            bj[b + 1][b] = bg[T];
            bk[b + 1][b] = bh[T];
            bl[b + 1][b] = bi[T++]
        }
    }
    function directions(a) {
        if (bv) {
            doTsp(a)
        }
        bf = new Array();
        br = 0;
        bt = 0;
        for (var i = 0; i < W.length; ++i) {
            if (ba[i])++br
        }
        bu = br * (br - 1);
        for (var i = 0; i < W.length; ++i) {
            if (ba[i]) {
                bf.push(makeDirWp(W[i]));
                getWayArr(i);
                break
            }
        }
        if (br > M) {
            alert("Too many locations! You have " + br + ", but max limit is " + M)
        } else {
            bg = new Array();
            bh = new Array();
            bi = new Array();
            bs = 0;
            if (typeof by == 'function') {
                by(G)
            }
            nextChunk(a)
        }
    }
    function nextChunk(e) {
        if (bs < bf.length) {
            var f = new Array();
            for (var i = 0; i < P && i + bs < bf.length; ++i) {
                f.push(bf[bs + i])
            }
            var g = f[0].location;
            var h = f[f.length - 1].location;
            var j = new Array();
            for (var i = 1; i < f.length - 1; i++) {
                j[i - 1] = f[i]
            }
            bs += P;
            if (bs < bf.length - 1) {
                bs--
            }
            var k = new google.maps.DirectionsService();
            k.route({
                origin: g,
                destination: h,
                waypoints: j,
                avoidHighways: R,
                travelMode: S
            },
            function(a, b) {
                if (b != google.maps.DirectionsStatus.OK) {
                    var c = V[b];
                    var d = true;
                    if (typeof bx == 'function') {
                        bx(c)
                    }
                } else {
                    for (var i = 0; i < a.routes[0].legs.length; ++i) {++bt;
                        bg.push(a.routes[0].legs[i]);
                        bi.push(a.routes[0].legs[i].duration.value);
                        bh.push(a.routes[0].legs[i].distance.value)
                    }
                    if (typeof by == 'function') {
                        by(G)
                    }
                }
                nextChunk(e)
            })
        } else {
            readyTsp(e)
        }
    }
    function readyTsp(a) {
        T = 0;
        bj = new Array();
        bk = new Array();
        bl = new Array();
        br = 0;
        for (var i = 0; i < W.length; ++i) {
            if (ba[i]) {
                bj.push(new Array());
                bk.push(new Array());
                bl.push(new Array());
                Z[br] = X[i];
                br++
            }
        }
        for (var i = 0; i < br; ++i) {
            bj[i][i] = null;
            bk[i][i] = 0;
            bl[i][i] = 0
        }
        for (var i = 0; i < W.length; ++i) {
            if (ba[i]) {
                getDistTable(i, 0);
                break
            }
        }
        doTsp(a)
    }
    function doTsp(a) {
        bm = new Array();
        for (var i = 0; i < br; ++i) {
            bm[i] = false
        }
        bn = new Array();
        bo = new Array();
        bq = new Array();
        bp = Q;
        bm[0] = true;
        bn[0] = 0;
        bv = true;
        if (br <= N + a) {
            tspBruteForce(a, 0, 0, 1)
        } else if (br <= O + a) {
            tspDynamic(a)
        } else {
            tspAntColonyK2(a)
        }
        prepareSolution()
    }
    function prepareSolution() {
        var a = new Array();
        for (var i = 0; i < W.length; ++i) {
            if (ba[i]) {
                a.push(i)
            }
        }
        var b = "";
        var c = new Array();
        var d = new Array();
        var e = new google.maps.LatLngBounds();
        for (var i = 1; i < bo.length; ++i) {
            c.push(bj[bo[i - 1]][bo[i]])
        }
        for (var i = 0; i < bo.length; ++i) {
            b += makeLatLng(W[a[bo[i]]]) + "\n";
            e.extend(W[a[bo[i]]])
        }
        d.push({
            legs: c,
            bounds: e
        });
        J = {
            routes: d
        };
        if (bD) google.maps.event.removeListener(bD);
        bD = google.maps.event.addListener(K, 'error', bA);
        if (typeof bw == 'function') {
            bw(G)
        }
    }
    function reverseSolution() {
        for (var i = 0; i < bo.length / 2; ++i) {
            var a = bo[bo.length - 1 - i];
            bo[bo.length - 1 - i] = bo[i];
            bo[i] = a
        }
        prepareSolution()
    }
    function addWaypoint(a, b) {
        var c = -1;
        for (var i = 0; i < W.length; ++i) {
            if (!ba[i]) {
                c = i;
                break
            }
        }
        if (c == -1) {
            if (W.length < M) {
                W.push(a);
                Y.push(b);
                ba.push(true);
                c = W.length - 1
            } else {
                return ( - 1)
            }
        } else {
            W[c] = a;
            Y[c] = b;
            ba[c] = true
        }
        return (c)
    }
    function addAddress(e, f, g) {
        bc = true;
        L.geocode({
            address: e
        },
        function(a, b) {
            if (b == google.maps.GeocoderStatus.OK) {
                bc = false; --bb; ++be;
                if (a.length >= 1) {
                    var c = a[0].geometry.location;
                    var d = addWaypoint(c, f);
                    X[d] = e;
                    if (typeof g == 'function') g(e, c)
                }
            } else if (b == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
                setTimeout(function() {
                    addAddress(e, f, g)
                },
                100)
            } else {--bb; ++be;
                bc = false;
                if (typeof(g) == 'function') g(e)
            }
        })
    }
    function geocodePosition(c, d) {
        L.geocode({
            latLng: c
        },
        function(a, b) {
            if (a && a.length > 0) {
                respAddress = a[0].formatted_address;
                if (typeof d == 'function') {
                    d(a[0])
                }
            } else {
                if (typeof d == 'function') {
                    d('Cannot determine address at this location.')
                }
            }
        })
    }
    function addDragMarker(b, c) {
        if (b == null) {
            b = H.getCenter()
        }
        var d = "images/marker0.png";
        var e = new google.maps.MarkerImage(d, new google.maps.Size(20, 34), new google.maps.Point(0, 0), new google.maps.Point(15, 34));
        setmarker = new google.maps.Marker({
            position: b,
            map: H,
            title: "drag me!",
            draggable: true,
            icon: e,
            cursor: 'pointer'
        });
		if (typeof c == 'function') {
            google.maps.event.addListener(setmarker, 'dragend', 
            function() {
                geocodePosition(setmarker.getPosition(), c)
            });
            google.maps.event.addListener(H, 'rightclick', 
            function(a) {
                setmarker.setPosition(a.latLng);
                geocodePosition(a.latLng, c)
            })
        }
    }
    function swapWaypoints(i, j) {
        var a = X[j];
        var b = W[j];
        var c = ba[j];
        var d = Y[j];
        X[j] = X[i];
        X[i] = a;
        W[j] = W[i];
        W[i] = b;
        ba[j] = ba[i];
        ba[i] = c;
        Y[j] = Y[i];
        Y[i] = d
    }
    BpTspSolver.prototype.startOver = function() {
        W = new Array();
        X = new Array();
        Y = new Array();
        Z = new Array();
        ba = new Array();
        bf = new Array();
        bg = new Array();
        bh = new Array();
        bi = new Array();
        bj = new Array();
        bk = new Array();
        bl = new Array();
        bm = new Array();
        bn = new Array();
        bo = new Array();
        bp = new Array();
        bq = new Array();
        br = 0;
        bs = 0;
        bb = 0;
        bc = false;
        bd = 0;
        be = 0;
        bv = false;
        bw = function() {};
        by = null;
        bB = false
    }
    function BpTspSolver(a, b, c) {
        H = a;
        I = b;
        L = new google.maps.Geocoder();
        K = new google.maps.DirectionsService();
        bA = c;
        G = this
    }
    BpTspSolver.prototype.addAddressWithLabel = function(a, b, c) {++bb; ++bd;
        G.addAddressAgain(a, b, c, bd - 1)
    }
    BpTspSolver.prototype.addAddress = function(a, b) {
        G.addAddressWithLabel(a, null, b)
    };
    BpTspSolver.prototype.addAddressAgain = function(a, b, c, d) {
        if (bc || d > be) {
            setTimeout(function() {
                G.addAddressAgain(a, b, c, d)
            },
            100);
            return
        }
        addAddress(a, b, c)
    };
    BpTspSolver.prototype.addWaypointWithLabel = function(a, b, c) {++bd;
        G.addWaypointAgain(a, b, c, bd - 1)
    };
    BpTspSolver.prototype.addWaypoint = function(a, b) {
        G.addWaypointWithLabel(a, null, b)
    };
    BpTspSolver.prototype.addWaypointAgain = function(a, b, c, d) {
        if (bc || d > be) {
            setTimeout(function() {
                G.addWaypointAgain(a, b, c, d)
            },
            100);
            return
        }
        addWaypoint(a, b); ++be;
        if (typeof(c) == 'function') {
            c(a)
        }
    }
    BpTspSolver.prototype.getWaypoints = function() {
        var a = [];
        for (var i = 0; i < W.length; i++) {
            if (ba[i]) {
                a.push(W[i])
            }
        }
        return a
    };
    BpTspSolver.prototype.getAddresses = function() {
        var a = [];
        for (var i = 0; i < X.length; i++) {
            if (ba[i]) a.push(X[i])
        }
        return a
    };
    BpTspSolver.prototype.getLabels = function() {
        var a = [];
        for (var i = 0; i < Y.length; i++) {
            if (ba[i]) a.push(Y[i])
        }
        return a
    };
    BpTspSolver.prototype.removeWaypoint = function(a) {
        for (var i = 0; i < W.length; ++i) {
            if (ba[i] && W[i].equals(a)) {
                ba[i] = false;
                return true
            }
        }
        return false
    };
    BpTspSolver.prototype.removeAddress = function(a) {
        for (var i = 0; i < X.length; ++i) {
            if (ba[i] && X[i] == a) {
                ba[i] = false;
                return true
            }
        }
        return false
    };
    BpTspSolver.prototype.setAsStop = function(a) {
        var j = -1;
        for (var i = W.length - 1; i >= 0; --i) {
            if (j == -1 && ba[i]) {
                j = i
            }
            if (ba[i] && W[i].equals(a)) {
                for (var k = i; k < j; ++k) {
                    swapWaypoints(k, k + 1)
                }
                break
            }
        }
    }
    BpTspSolver.prototype.setAsStart = function(a) {
        var j = -1;
        for (var i = 0; i < W.length; ++i) {
            if (j == -1 && ba[i]) {
                j = i
            }
            if (ba[i] && W[i].equals(a)) {
                for (var k = i; k > j; --k) {
                    swapWaypoints(k, k - 1)
                }
                break
            }
        }
    }
    BpTspSolver.prototype.getGDirections = function() {
        return J
    };
    BpTspSolver.prototype.getGDirectionsService = function() {
        return K
    };
    BpTspSolver.prototype.getOrder = function() {
        return bo
    }
    BpTspSolver.prototype.getAvoidHighways = function() {
        return R
    }
    BpTspSolver.prototype.setAvoidHighways = function(a) {
        R = a
    }
    BpTspSolver.prototype.getTravelMode = function() {
        return S
    }
    BpTspSolver.prototype.setTravelMode = function(a) {
        S = a
    }
    BpTspSolver.prototype.getDurations = function() {
        return bl
    }
    BpTspSolver.prototype.getTotalDuration = function() {
        return gebDirections.getDuration().seconds
    }
    BpTspSolver.prototype.isReady = function() {
        return bb == 0
    };
    BpTspSolver.prototype.solveRoundTrip = function(a, b) {
        if (bB) {
            alert('Cannot continue after fatal errors.');
            return
        }
        if (!this.isReady()) {
            setTimeout(function() {
                G.solveRoundTrip(a, b)
            },
            20);
            return
        }
        if (typeof a == 'function') bw = a;
        if (typeof b == 'function') bx = b;
        directions(0)
    };
    BpTspSolver.prototype.solveAtoZ = function(a, b) {
        if (bB) {
            alert('Cannot continue after fatal errors.');
            return
        }
        if (!this.isReady()) {
            setTimeout(function() {
                G.solveAtoZ(a, b)
            },
            20);
            return
        }
        if (typeof a == 'function') bw = a;
        if (typeof b == 'function') bx = b;
        directions(1)
    };
    BpTspSolver.prototype.setOnProgressCallback = function(a) {
        by = a
    }
    BpTspSolver.prototype.getNumDirectionsComputed = function() {
        return bt
    }
    BpTspSolver.prototype.getNumDirectionsNeeded = function() {
        return bu
    }
    BpTspSolver.prototype.reverseSolution = function() {
        reverseSolution()
    }
    BpTspSolver.prototype.addDragMarker = function(a) {
        if (typeof a == 'function') onDragcallback = a;
        addDragMarker(null, onDragcallback)
    }
    window.BpTspSolver = BpTspSolver
})();
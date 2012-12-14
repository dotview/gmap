/*
* Currently supports:
* GeoRSS:
*   - geo:lat/geo:long/geo:lon
*   - point
*   - line
*   - polygon
*   - circle
*   - where
*
* GML
*   - Point
*   - LineString
*   - Polygon
*/

var GeoRSSLayer = function (pushpinOptions, polylineOptions, polygonOptions) {
    var _map = map,
        _callback = null,
        _pushpinOptions = pushpinOptions,
        _polylineOptions = polylineOptions,
        _polygonOptions = polygonOptions,
        _allCoords = [];

    /*****************
    * Private Methods
    ******************/
    function parseGeoRSS(xml) {
        var items = new Microsoft.Maps.EntityCollection();

        //Read RSS itms
        $(xml).find("item").each(function () {
            var shape = parseGeoRSSItem($(this));
            if (shape != null) {
                items.push(shape);
            }
        });

        //read ATOM entry's
        $(xml).find("entry").each(function () {
            var shape = parseGeoRSSItem($(this));
            if (shape != null) {
                items.push(shape);
            }
        });

        if (_callback != null) {
            _callback(items);
        }
    }

    function parseGeoRSSItem(i) {
        var tempCoord = null;

        var addressid,title, description, icon, link, isPushpin = false; ;
        var shape = null;

        i.children().each(function () {
            var tag = this.tagName.toLowerCase();
            switch (tag) {
				case "addressid":
                    addressid = $(this).text();
                    break;
                case "title":
                    title = $(this).text();
                    break;
                case "content":
                case "summary":
                case "description":
                    description = $(this).text();
                    break;
                case "icon":
                case "mappoint:icon":
                    icon = $(this).text();
                    break;
                case "link":
                    link = $(this).text();
                    break;
                case "geo:lat":
                    var c = parseFloat($(this).text());

                    if (tempCoord == null) {
                        tempCoord = c;
                    }
                    else {
                        tempCoord = new Microsoft.Maps.Location(c, tempCoord);
                        _allCoords.push(tempCoord);
                        shape = new Microsoft.Maps.Pushpin(tempCoord);
                        isPushpin = true;
                    }
                    break;
                case "geo:lon":
                case "geo:long":
                    var c = parseFloat($(this).text());

                    if (tempCoord == null) {
                        tempCoord = c;
                    }
                    else {
                        tempCoord = new Microsoft.Maps.Location(tempCoord, c);
                        _allCoords.push(tempCoord);
                        shape = new Microsoft.Maps.Pushpin(tempCoord);
                        isPushpin = true;
                    }
                    break;
                case "geo:point":
                    var tLat, tLon;
                    i.children().each(function () {
                        if (this.tagName.toLowerCase() == "geo:lat") {
                            tLat = parseFloat($(this).text());
                        }
                        else if (this.tagName.toLowerCase() == "geo:long") {
                            tLon = parseFloat($(this).text());
                        }
                    });

                    if (tLat != null && tLon != null) {
                        tempCoord = new Microsoft.Maps.Location(tLat, tLon);
                        _allCoords.push(tempCoord);
                        shape = new Microsoft.Maps.Pushpin(tempCoord);
                        isPushpin = true;
                    }
                    break;
                case "georss:point":
                    tempCoord = parseCoord($(this).text());
                    if (tempCoord != null) {
                        _allCoords.push(tempCoord);
                        shape = new Microsoft.Maps.Pushpin(tempCoord);
                        isPushpin = true;
                    }
                    break;
                case "georss:line":
                    tempCoord = parseCoords($(this).text(), 2);
                    if (tempCoord != null && tempCoord.length >= 2) {
                        _allCoords = _allCoords.concat(tempCoord);
                        shape = new Microsoft.Maps.Polyline(tempCoord, _polylineOptions);
                    }
                    break;
                case "georss:polygon":
                    tempCoord = parseCoords($(this).text(), 2);
                    if (tempCoord != null && tempCoord.length >= 3) {
                        _allCoords = _allCoords.concat(tempCoord);
                        shape = new Microsoft.Maps.Polygon(tempCoord, _polygonOptions);
                    }
                    break;
                case "georss:where":
                    var gmlItem = parseGMLItem(this.firstChild);
                    shape = gmlItem.shape;
                    isPushpin = gmlItem.isPushpin;
                    break;
                case "georss:circle":  
                    var v = $.trim($(this).text().replace(/,/g, ' ').replace(/[\s]{2,}/g, ' ')).split(' ');
                    if (v.length > 2) {
                        tempCoord = geoTools.GenerateRegularPolygon(new Microsoft.Maps.Location(parseFloat(v[0]), parseFloat(v[1])), parseFloat(v[2]), geoTools.Constants.EARTH_RADIUS_METERS, 25, 0);
                        _allCoords = _allCoords.concat(tempCoord);
                        shape = new Microsoft.Maps.Polygon(tempCoord, _polygonOptions);
                    }
                    break;
                default:
                    //Handle GML tags
                    if (tag.match("^gml:") == "gml:") {
                        var gmlItem = parseGMLItem(this);
                        shape = gmlItem.shape;
                        isPushpin = gmlItem.isPushpin;
                    }
                    break;
            }
        });

        if (shape != null) {
            shape.Metadata = {
				addressid:addressid,
                title: title,
                description: description,
                icon: icon,
                link: link
            };

            var opt = _pushpinOptions; ;
            if (isPushpin && icon != null && icon != '') {
                if (opt != null) {
                    opt.icon = icon;
                }
                else {
                    opt = { icon: icon };
                }
            }

            if (opt != null) {
                shape.setOptions(opt);
            }
        }

        return shape;
    }

    function parseGMLItem(i) {
        var s = null, isPushpin = false;

        if (i != null && i.tagName == null) {
            if (i.nextSibling.tagName != null) {
                i = i.nextSibling;
            }
            else {
                i == null;
            }
        }

        if (i != null) {
            switch (i.tagName.toLowerCase()) {
                case "gml:point":
                    var coord = null;
                    $(i).children().each(function () {
                        if (this.tagName.toLowerCase() == "gml:pos" ||
                            this.tagName.toLowerCase() == "gml:coordinates") {
                            coord = parseCoord($(this).text());
                        }
                    });

                    if (coord != null) {
                        _allCoords.push(coord);
                        s = new Microsoft.Maps.Pushpin(coord);
                        isPushpin = true;
                    }
                    break;
                case "gml:linestring":
                    var v = [];
                    $(i).children().each(function () {
                        var coords = parsePosList(this);
                        if (coords != null && coords.length >= 2) {
                            v.push(coords);
                        }
                    });

                    if (v.length > 0) {
                        _allCoords.concat(v);
                        s = new Microsoft.Maps.Polyline(v[0], _polylineOptions);
                    }
                    break;
                case "gml:polygon":
                    var exR = [], inR = [];
                    $(i).children().each(function () {
                        switch (this.tagName.toLowerCase()) {
                            case "gml:exterior":
                            case "gml:outerboundaryis":
                                var coords = parseLinearRing(this);
                                if (coords != null && coords.length >= 3) {
                                    exR = coords;
                                }
                                break;
                            case "gml:interior":
                            case "gml:innerboundaryis":
                                var coords = parseLinearRing(this);
                                if (coords != null && coords.length >= 3) {
                                    inR.push(coords);
                                }
                                break;
                        }
                    });

                    if (exR.length > 0) {
                        //TODO
                        //Currently no support for inner polygons or polygons with holes
                        //Draw first exterior ring     
                        _allCoords.concat(exR);
                        s = new Microsoft.Maps.Polygon(exR, _polygonOptions);
                    }
                    break;
                    break;
                default:
                    break;
            }
        }

        return { shape: s, isPushpin: isPushpin };
    }

    /*
    * Parses a GML LinearRing tag
    */
    function parseLinearRing(ring) {
        var rCoords = null;
        $(ring).children().each(function () {
            if (this.tagName.toLowerCase() == "gml:linearring") {
                $(this).children().each(function () {
                    var coords = parsePosList(this);
                    if (coords != null && coords.length >= 3) {
                        rCoords = coords;
                    }
                });
            }
        });

        return rCoords;
    }

    /*
    * Parses a GML posList or coordinates tag
    */
    function parsePosList(list) {
        if (list.tagName.toLowerCase() == "gml:poslist" ||
           list.tagName.toLowerCase() == "gml:coordinates") {
            var dim = $(list).attr("dimension");
            if (dim != null && dim != '') {
                dim = parseInt(dim);
                if (dim == null || dim < 1) {
                    dim = 2;
                }
            }
            else {
                dim = 2;
            }

            return parseCoords($(list).text(), dim);
        }

        return null;
    }

    /*
    * Parses a string list of coordinates. Handles 2D and 3D coordinate sets.
    * dim - number of values to represent coordinate. 
    */
    function parseCoords(sCoord, dim) {
        if (dim == null || dim < 1) {
            dim = 2;
        }

        var v = $.trim(sCoord.replace(/,/g, ' ').replace(/[\s]{2,}/g, ' ')).split(' ');
        if (v.length > 1) {
            var c = [];

            for (var i = 0; i < v.length; i = i + dim) {
                c.push(new Microsoft.Maps.Location(parseFloat(v[i]), parseFloat(v[i + 1])));
            }

            return c;
        }

        return null;
    }

    /*
    * Parses a string list of coordinate.
    */
    function parseCoord(sCoord) {
        var v = $.trim(sCoord.replace(/,/g, ' ').replace(/[\s]{2,}/g, ' ')).split(' ');
        if (v.length > 1) {
            return new Microsoft.Maps.Location(parseFloat(v[0]), parseFloat(v[1]));
        }

        return null;
    }

    /****************
    * Public Methods
    ****************/

    this.LoadGeoRSS = function (link, callback) {
        _callback = callback;
        _bounds = new Microsoft.Maps.LocationRect(new Microsoft.Maps.Location(0, 0), 360, 180);

        $.ajax({
            type: "GET",
            url: link,
            dataType: "xml",
            success: function (xml) {
                parseGeoRSS(xml);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert(thrownError.description);
            }
        });
    };

    this.GetBounds = function () {
        if (_allCoords != null && _allCoords.length > 0) {
            return Microsoft.Maps.LocationRect.fromLocations(_allCoords);
        }

        return null;
    };
};
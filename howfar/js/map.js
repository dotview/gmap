window.dotviewmap = (function(window, document, $, undefined) {
    var getOSMMapType = function() {
        return new google.maps.ImageMapType({
            getTileUrl: function(coord, zoom) {
                return "http://tile.openstreetmap.org/" + zoom + "/" + coord.x + "/" + coord.y + ".png"

            },
            tileSize: new google.maps.Size(256, 256),
            isPng: true,
            maxZoom: 18,
            name: "OSM"

        })

    };
    var CanvasOverlay = (function() {
        function CanvasOverlay(point, canvasID, clb, map) {
            this.point = point;
            this.addclb = clb;
            this.canvasID = canvasID;
            this.hidden = false;
            this.map_ = map;
            this.div_ = null;
            this.setMap(map)

        }
        CanvasOverlay.prototype = new google.maps.OverlayView();
        CanvasOverlay.prototype.onAdd = function() {
            var div = document.createElement("DIV");
            div.style.border = "none";
            div.style.borderWidth = "0px";
            div.style.position = "absolute";
            var cnvs = document.createElement("canvas");
            cnvs.id = this.canvasID;
            cnvs.width = 20;
            cnvs.height = 20;
            div.appendChild(cnvs);
            this.div_ = div;
            this.hasCalledCallback = false;
            var panes = this.getPanes();
            panes.mapPane.appendChild(div)

        };
        CanvasOverlay.prototype.draw = function() {
            var p = this.getProjection().fromLatLngToDivPixel(this.point);
            var h = parseInt(this.div_.clientHeight, 10);
            this.div_.style.left = (p.x) + "px";
            this.div_.style.top = (p.y - h) + "px";
            if (!this.hasCalledCallback) {
                this.hasCalledCallback = true;
                this.addclb()

            }

        };
        CanvasOverlay.prototype.fromLatLngToDivPixel = function(point) {
            return this.getProjection().fromLatLngToDivPixel(point)

        };
        CanvasOverlay.prototype.fromDivPixelToLatLng = function(point) {
            return this.getProjection().fromDivPixelToLatLng(point)

        };
        CanvasOverlay.prototype.setPoint = function(point) {
            this.point = point;
            this.draw()

        };
        CanvasOverlay.prototype.getPoint = function() {
            return this.point

        };
        CanvasOverlay.prototype.onRemove = function() {
            this.div_.parentNode.removeChild(this.div_);
            this.div_ = null

        };
        CanvasOverlay.prototype.hide = function() {
            if (this.div_) {
                this.div_.style.visibility = "hidden"

            }

        };
        CanvasOverlay.prototype.show = function() {
            if (this.div_) {
                this.div_.style.visibility = "visible"

            }

        };
        CanvasOverlay.prototype.toggle = function() {
            if (this.div_) {
                if (this.div_.style.visibility == "hidden") {
                    this.show()

                } else {
                    this.hide()

                }

            }

        };
        CanvasOverlay.prototype.toggleDOM = function() {
            if (this.getMap()) {
                this.setMap(null)

            } else {
                this.setMap(this.map_)

            }

        };
        return CanvasOverlay

    } ());
    var layerCount = 0;
    var layerData = {};
    var minZoomLevel = 5;
    var globalLayers = {};
    var func = function(useroptions) {
        var that = {};
        var layers = {};
        var mapFullyLoaded = false;
        var idleTimeout = false;
        var isHidden = false;
        var createdMap = false;
        var options = useroptions || {};
        var defaults = {
            mapStartZoom: 11,
            dataUrlPrefix: "http://dotviewmap.stefanwehrmeyer.com/data/",
            mapStartCenter: {
                lat: 52.51037058766109,
                lng: 13.333282470703125

            },
            mapStyles: {
                Night: [{
                    featureType: "all",
                    elementType: "all",
                    stylers: [{
                        invert_lightness: true

                    }]

                }]

            },
            startMapStyle: null,
            mapTypes: {
                OSM: getOSMMapType()

            },
            startMapType: google.maps.MapTypeId.ROADMAP,
            mapTypeIds: [google.maps.MapTypeId.ROADMAP],
            heightCacheFactor: 4,
            widthCacheFactor: 4,
            layerSettings: {}

        };
        that.env = {};
        for (var key in defaults) {
            if (options[key] !== undefined) {
                that.env[key] = options[key]

            } else {
                that.env[key] = defaults[key]

            }

        }
        if (options.layerSettings !== undefined) {
            that.env.layerSettings = options.layerSettings

        }
        that.env.mapGStartCenter = new google.maps.LatLng(that.env.mapStartCenter.lat, that.env.mapStartCenter.lng);
        that.env.circleRadians = (Math.PI / 180) * 360;
        that.DegToRadFactor = Math.PI / 180;
        that.RadToDegFactor = 180 / Math.PI;
        that.offsetActive = false;
        $(window).resize(function() {
            that.resize()

        });
        that.createLayer = function() {
            return {
                getTitle: function() {
                    return ""

                },
                activate: function() {},
                deactivate: function() {},
                getDrawingLevel: function() {
                    return 20

                },
                redraw: function(ctx) {},
                setup: function(container) {},
                destroy: function() {}

            }

        };
        var getMapDivHeight = function() {
            return $(window).height() - $("#topnav").height()

        };
        that.initMap = function(mapID) {
            createdMap = true;
            var style,
            type;
            that.mapID = mapID;
            that.env.ie = false;
            for (style in that.env.mapStyles) {
                that.env.mapTypeIds.push(style)

            }
            for (type in that.env.mapTypes) {
                that.env.mapTypeIds.push(type)

            }
            var mapOptions = {
                zoom: that.env.mapStartZoom,
                center: that.env.mapGStartCenter,
                mapTypeId: that.env.startMapType,
                mapTypeControlOptions: {
                    mapTypeIds: that.env.mapTypeIds

                },
                scaleControl: true,
                scaleControlOptions: {
                    position: google.maps.ControlPosition.BOTTOM_LEFT

                }

            };
            $("#" + that.mapID).height(getMapDivHeight());
            that.map = new google.maps.Map(document.getElementById(that.mapID), mapOptions);
            for (style in that.env.mapStyles) {
                var styledMapType = new google.maps.StyledMapType(that.env.mapStyles[style], {
                    name: style

                });
                that.map.mapTypes.set(style, styledMapType)

            }
            for (type in that.env.mapTypes) {
                that.map.mapTypes.set(type, that.env.mapTypes[type])

            }
            if (that.env.startMapStyle) {
                that.map.setMapTypeId(that.env.startMapStyle)

            }
            google.maps.event.addListener(that.map, "maptypeid_changed", 
            function() {
                if (that.map.getMapTypeId() === "OSM") {
                    $("#osm-copyright").show().parent().show()

                } else {
                    $("#osm-copyright").hide()

                }
                if (mapFullyLoaded) {
                    that.moveMapPosition();
                    Event.trigger("redraw")

                }

            });
            that.addToMap(that.map)

        };
        that.addToMap = function(mapObject) {
            that.map = mapObject;
            that.canvas_id = "dotviewmap-canvas";
            while (document.getElementById(that.canvas_id) !== null) {
                that.canvas_id += "0"

            }
            that.mapSize = {
                width: $(that.map.getDiv()).width(),
                height: getMapDivHeight()

            };
            that.heightCacheOffset = (that.mapSize.height * (that.env.heightCacheFactor - 1)) / 2;
            that.widthCacheOffset = (that.mapSize.width * (that.env.widthCacheFactor - 1)) / 2;
            var onaddcallback = function() {
                mapFullyLoaded = true;
                that.canvas = document.getElementById(that.canvas_id);
                if (typeof G_vmlCanvasManager !== "undefined") {
                    that.env.ie = true;
                    alert("Your browser might or might not work. Rather use a better one.");
                    G_vmlCanvasManager.initElement(that.canvas)

                }
                if (typeof that.canvas.getContext === "undefined") {
                    that.showMessage("Please Use a more modern browser", true);
                    return

                }
                that.setCanvasDimensions();
                that.ctx = that.canvas.getContext("2d");
                that.checkCompositing();
                that.moveMapPosition();
                that.setup();
                Event.trigger("initDone")

            };
            that.canvasoverlay = new CanvasOverlay(that.env.mapGStartCenter, that.canvas_id, onaddcallback, that.map);
            google.maps.event.addListener(that.map, "zoom_changed", 
            function(oldLevel, newLevel) {
                that.ctx.clearRect(0, 0, that.canvas.width, that.canvas.height);
                window.setTimeout(function() {
                    if (that.map.getZoom() >= minZoomLevel) {
                        that.moveMapPosition();
                        Event.trigger("zoom");
                        Event.trigger("redraw")

                    }

                },
                500)

            });
            google.maps.event.addListener(that.map, "dragend", 
            function() {
                if (that.map.getZoom() >= minZoomLevel) {
                    if (that.moveMapPosition()) {
                        Event.trigger("redraw")

                    }

                }

            })

        };
        that.destroy = function() {
            that.canvasoverlay.setMap(null);
            for (var idname in layers) {
                layers[idname].layerObject.destroy()

            }

        };
        that.hide = function() {
            that.canvasoverlay.hide();
            isHidden = true

        };
        that.show = function() {
            that.canvasoverlay.show();
            isHidden = false;
            dotviewmap.trigger("redraw")

        };
        that.moveMapPosition = function() {
            that.mapBounds = that.map.getBounds();
            that.mapBoundsXY = that.canvasoverlay.fromLatLngToDivPixel(that.mapBounds.getSouthWest());
            that.canvasoverlayxy = that.canvasoverlay.fromLatLngToDivPixel(that.canvasoverlay.getPoint());
            var boundnexy = that.canvasoverlay.fromLatLngToDivPixel(that.mapBounds.getNorthEast());
            var need = false;
            if ((that.mapBoundsXY.x - that.widthCacheOffset * (1 / 3)) < that.canvasoverlayxy.x) {
                need = true

            } else {
                if ((boundnexy.x + that.widthCacheOffset * (1 / 3)) > that.canvasoverlayxy.x + that.canvas.width) {
                    need = true

                } else {
                    if ((that.mapBoundsXY.y + that.heightCacheOffset * (1 / 3)) > that.canvasoverlayxy.y) {
                        need = true

                    } else {
                        if ((boundnexy.y - that.heightCacheOffset * (1 / 3)) < that.canvasoverlayxy.y - that.canvas.height) {
                            need = true

                        }

                    }

                }

            }
            if (need) {
                that.setCanvasPosition();
                return true

            }
            return false

        };
        that.setCanvasPosition = function() {
            var point = that.getCanvasPosition();
            that.canvasoverlay.setPoint(point);
            that.canvasoverlayxy = that.canvasoverlay.fromLatLngToDivPixel(point)

        };
        that.getCanvasPosition = function() {
            var pxnpm = new google.maps.Point(that.mapBoundsXY.x - that.widthCacheOffset, that.mapBoundsXY.y + that.heightCacheOffset);
            return that.canvasoverlay.fromDivPixelToLatLng(pxnpm)

        };
        that.setCanvasDimensions = function() {
            that.mapSize = {
                width: $(that.map.getDiv()).width(),
                height: getMapDivHeight()

            };
            that.heightCacheOffset = (that.mapSize.height * (that.env.heightCacheFactor - 1)) / 2;
            that.widthCacheOffset = (that.mapSize.width * (that.env.widthCacheFactor - 1)) / 2;
            that.canvas.width = that.mapSize.width * that.env.widthCacheFactor;
            that.canvas.height = that.mapSize.height * that.env.heightCacheFactor

        };
        that.resize = function() {
            $("#" + that.mapID).height(getMapDivHeight());
            if (that.map) {
                google.maps.event.trigger(that.map, "resize");
                that.setCanvasDimensions();
                that.moveMapPosition();
                Event.trigger("resize");
                Event.trigger("redraw")

            }

        };
        that.setNightTime = function() {
            that.map.setMapTypeId("Night")

        };
        that.setDayTime = function() {
            that.map.setMapTypeId(google.maps.MapTypeId.ROADMAP)

        };
        that.checkCompositing = function() {
            if (typeof that.ctx.getImageData === "undefined") {
                that.env.hasCompositing = false;
                return

            }
            that.env.hasCompositing = true;
            that.ctx.save();
            that.ctx.clearRect(0, 0, that.canvas.width, that.canvas.height);
            that.ctx.fillStyle = "rgba(255,255,255,1)";
            that.ctx.fillRect(0, 0, 3, 3);
            that.ctx.globalCompositeOperation = "destination-in";
            that.ctx.fillRect(2, 2, 3, 3);
            that.ctx.globalCompositeOperation = "source-out";
            that.ctx.fillStyle = "rgba(75,75,75,0.75)";
            that.ctx.fillRect(0, 0, 5, 5);
            var pix = that.ctx.getImageData(1, 1, 1, 1).data;
            if (pix[3] === 0) {
                that.env.hasCompositing = false

            }
            that.ctx.restore();
            that.ctx.clearRect(0, 0, that.canvas.width, that.canvas.height)

        };
        var Event = (function() {
            var events = {};
            return {
                trigger: function(ev, paramObj) {
                    if (events[ev] !== undefined) {
                        for (var i = 0; i < events[ev].length; i++) {
                            events[ev][i](paramObj)

                        }

                    }

                },
                bind: function(ev, fn) {
                    if (events[ev] === undefined) {
                        events[ev] = []

                    }
                    events[ev].push(fn)

                },
                unbind: function(ev, fn) {
                    if (events[ev] !== undefined) {
                        var nCustomEvents = [];
                        for (var i = 0; i < events[ev].length; i++) {
                            if (events[ev][i] != fn) {
                                nCustomEvents.push(events[ev][i])

                            }

                        }
                        events[ev] = nCustomEvents

                    }

                }

            }

        } ());
        that.trigger = function(name) {
            Event.trigger(name)

        };
        that.bind = function(name, fn) {
            Event.bind(name, fn)

        };
        that.unbind = function(name, fn) {
            Event.unbind(name, fn)

        };
        that.getControls = function(idname) {
            return $("#controls")

        };
        that.getDrawingContext = function() {
            return that.ctx

        };
        that.redraw = function() {
            var idname,
            i;
            window.clearTimeout(idleTimeout);
            that.ctx.globalCompositeOperation = "source-over";
            that.ctx.globalAlpha = 1;
            that.ctx.clearRect(0, 0, that.canvas.width, that.canvas.height);
            if (layerCount > 0) {
                var layerArr = [];
                for (idname in layers) {
                    layerArr.push(layers[idname])

                }
                layerArr.sort(function(a, b) {
                    return a.layerObject.getDrawingLevel() - b.layerObject.getDrawingLevel()

                });
                for (i = 0; i < layerArr.length; i++) {
                    layerArr[i].layerObject.redraw(that.ctx)

                }

            } else {
                for (idname in layers) {
                    layers[idname].layerObject.redraw(that.ctx)

                }

            }
            that.canvasoverlay.draw();
            idleTimeout = window.setTimeout(function() {
                that.trigger("idleAfterRedrawing")

            },
            500)

        };
        that.getDistanceInKm = function(pos1, pos2) {
            var R = 6371;
            return Math.acos(Math.sin(pos1.lat * that.DegToRadFactor) * Math.sin(pos2.lat * that.DegToRadFactor) + Math.cos(pos1.lat * that.DegToRadFactor) * Math.cos(pos2.lat * that.DegToRadFactor) * Math.cos((pos2.lng - pos1.lng) * that.DegToRadFactor)) * R

        };
        that.setup = function() {
            that.bind("redraw", that.redraw);
            for (var idname in layers) {
                that.setupLayer(idname)

            }
            that.resize()

        };
        that.addLayer = function(name, ui) {
            layers[name] = globalLayers[name] || {};
            layers[name]["ui"] = ui

        };
        that.setupLayer = function(idname, layer) {
            layers[idname].idname = idname;
            layers[idname].layerObject = layers[idname].create(that);
            if (layers[idname].ui) {
                layers[idname].ui(that, layers[idname].layerObject, $, window)

            }
            var container = that.getControls(idname);
            var lsettings = {};
            if (that.env.layerSettings[idname] !== undefined) {
                lsettings = that.env.layerSettings[idname]

            }
            lsettings.isOpera = $.browser.opera;
            layers[idname].layerObject.setup(container, lsettings)

        };
        that.getCanvasXY = function(pos) {
            var xy = that.canvasoverlay.fromLatLngToDivPixel(new google.maps.LatLng(pos.lat, pos.lng));
            var x = xy.x - (that.canvasoverlayxy.x);
            var y = xy.y - (that.canvasoverlayxy.y - that.canvas.height);
            return {
                x: x,
                y: y

            }

        };
        that.getDivXY = function(pos) {
            return that.canvasoverlay.fromLatLngToDivPixel(new google.maps.LatLng(pos.lat, pos.lng))

        };
        that.getLatLngFromWindowXY = function(x, y) {
            var latlng = that.canvasoverlay.getProjection().fromContainerPixelToLatLng(new google.maps.Point(x, y), true);
            return {
                lat: latlng.lat(),
                lng: latlng.lng()

            }

        };
        that.getLatLngFromCanvasXY = function(x, y) {
            x = x + that.canvasoverlayxy.x;
            y = y + (that.canvasoverlayxy.y - that.canvas.height);
            var latlng = that.canvasoverlay.getProjection().fromDivPixelToLatLng(new google.maps.Point(x, y), true);
            return {
                lat: latlng.lat(),
                lng: latlng.lng()

            }

        };
        that.getLayerData = function(idname, index) {
            return layerData[idname][index]

        };
        that.getLayer = function(idname) {
            return layers[idname].layerObject

        };
        return that

    };
    func.addLayer = function(name, obj) {
        globalLayers[name] = globalLayers[name] || {};
        globalLayers[name] = {
            create: obj

        };
        layerCount += 1

    };
    func.addLayerData = function(name, obj) {
        if (!layerData[name]) {
            layerData[name] = []

        }
        layerData[name].push(obj)

    };
    func.isBrowserSupported = function() {
        return !! window.Worker && !!window.postMessage

    };
    func.forCoordinates = function(coords, callback) {
        $.getJSON("http://www.dotviewmap.net/api/checkCoordinates/?callback=?", coords, 
        function(data) {
            callback(data)

        })

    };
    return func

} (window, document, $));
dotviewmap.addLayer("urbanDistance", 
function(dotviewmap) {
    var debugging = true;
    var Event = (function() {
        var events = {};
        return {
            trigger: function(ev, paramObj) {
                if (events[ev] !== undefined) {
                    for (var i = 0; i < events[ev].length; i++) {
                        events[ev][i](paramObj)

                    }

                }

            },
            bind: function(ev, fn) {
                if (events[ev] === undefined) {
                    events[ev] = []

                }
                events[ev].push(fn)

            },
            unbind: function(ev, fn) {
                if (events[ev] !== undefined) {
                    var nCustomEvents = [];
                    for (var i = 0; i < events[ev].length; i++) {
                        if (events[ev][i] != fn) {
                            nCustomEvents.push(events[ev][i])

                        }

                    }
                    events[ev] = nCustomEvents

                }

            }

        }

    } ());
    var that = dotviewmap.createLayer();
    that.idname = "urbanDistance";
    that.calculationLoopCount = 0;
    var options = {
        secondsPerKmWalking: 13 * 60,
        secondsPerKmBiking: 6 * 60,
        colorMaxAcceptableTime: 120,
        colorBaseGradientColor: 120,
        colorMaxGradientColor: 240,
        maxWalkTime: 15 * 60,
        maxWalkTravelTime: 180,
        dayTimeEnabled: true,
        intervalKey: "m1",
        animateAreaGrowth: false,
        animatedAreaOpacity: false,
        defaultStartAtPosition: {
            lat: dotviewmap.map.getCenter().lat(),
            lng: dotviewmap.map.getCenter().lng()

        },
        darkOverlayColor: "rgba(50,50,50,0.4)",
        availableTimes: ["0", "1", "2", "3", "4"],
        drawColor: "rgba(0,0,0,1)",
        estimatedMaxCalculateCalls: 50000,
        cityData: "berlin",
        calculateOnDrag: false,
        dataSize: 9509991,
        dataUrlPrefix: dotviewmap.env.dataUrlPrefix,
        intersection: false,
        color: false,
        isOpera: false,
        northwest: {
            lat: 52.754364,
            lng: 12.882953

        },
        southeast: {
            lat: 52.29693,
            lng: 13.908883

        },
        workerURL: "http://www.dotviewmap.net/media/js/worker.js",
        apiVersion: 1,
        copyright: ""

    };
    if (debugging) {
        options.workerURL = "js/worker.js"

    }
    var localDefault = {};
    for (var key in options) {
        localDefault[key] = options[key]

    }
    options.secondsPerKm = options.secondsPerKmWalking;
    options.reportInterval = Math.round(options.estimatedMaxCalculateCalls / 20);
    var LOCK = false,
    numberOfCalculations = 0,
    canCalculate = false,
    positionCounter = -1,
    stationList = [],
    blockGrid = undefined,
    stations = {},
    lines = {},
    colorCache = {},
    blockCountX = undefined,
    blockCountY = undefined,
    blockSize = 0.5,
    imageData = null,
    coveredArea = false;
    var getRealWorkerFacade = function() {
        return function(path) {
            return new window.Worker(path)

        }

    };
    var getFakeWorkerFacade = function() {
        var worker = false,
        master = {},
        loaded = false;
        var that = function(path) {
            var theworker = {},
            loaded = false,
            callings = [];
            theworker.postToWorkerFunction = function(args) {
                worker({
                    data: args

                })

            };
            theworker.postMessage = function(params) {
                if (!loaded) {
                    callings.push(params);
                    return

                }
                theworker.postToWorkerFunction(params)

            };
            master = theworker;
            var scr = document.createElement("SCRIPT");
            scr.src = path;
            scr.type = "text/javascript";
            scr.onload = function() {
                loaded = true;
                while (callings.length > 0) {
                    theworker.postToWorkerFunction(callings[0]);
                    callings.shift()

                }

            };
            document.body.appendChild(scr);
            return theworker

        };
        that.fake = true;
        that.add = function(path, wrk) {
            worker = wrk;
            return function(param) {
                master.onmessage({
                    data: param

                })

            }

        };
        that.toString = function() {
            return "FakeWorker('" + path + "')"

        };
        return that

    };
    var getCrossDomainWorkerFacade = function() {
        var loaded = false,
        workers = {},
        workerCounter = 0,
        iframeId = "dotviewmapCrossDomain",
        targetOrigin = "http://www.dotviewmap.net";
        var iframe = window.frames[iframeId];
        if (iframe === undefined) {
            iframe = document.createElement("iframe");
            iframe.onload = function() {
                loaded = true;
                for (var workerId in workers) {
                    workers[workerId].processQueue()

                }

            };
            iframe.id = iframeId;
            iframe.name = iframeId;
            iframe.src = "http://www.dotviewmap.net/media/api/" + options.apiVersion + "/dotviewmap.html";
            iframe.style.position = "absolute";
            iframe.style.left = "-100000px";
            iframe.style.visibility = "hidden";
            iframe.width = "1";
            iframe.height = "1";
            document.body.appendChild(iframe);
            iframe = window.frames[iframeId]

        }
        var receiveMessage = function(event) {
            if (event.origin !== targetOrigin) {
                return

            }
            var data = JSON.parse(event.data);
            workers[data.index][data.command]({
                data: data.payload

            })

        };
        window.addEventListener("message", receiveMessage, false);
        return function(path) {
            var queue = [],
            that = {
                index: workerCounter,
                processQueue: function() {
                    var obj;
                    obj = queue.pop();
                    while (obj !== undefined) {
                        this.postMessage(obj);
                        obj = queue.pop()

                    }

                },
                postMessage: function(obj) {
                    if (!loaded) {
                        queue.push(obj);
                        return

                    }
                    iframe.postMessage(JSON.stringify({
                        index: this.index,
                        command: "postMessage",
                        payload: obj

                    }), targetOrigin)

                },
                terminate: function() {
                    iframe.postMessage(JSON.stringify({
                        index: this.index,
                        command: "terminate"

                    }), targetOrigin)

                },
                ping: function() {
                    iframe.postMessage(JSON.stringify({
                        index: this.index,
                        command: "ping"

                    }), targetOrigin)

                }

            };
            workers[workerCounter++] = that;
            return that

        }

    };
    Workerfacade = undefined;
    if ( !! window.Worker) {
        if (document.location.hostname.indexOf("www.dotviewmap.net") != -1 || debugging) {
            WorkerFacade = getRealWorkerFacade()

        } else {
            WorkerFacade = getCrossDomainWorkerFacade()

        }

    } else {
        WorkerFacade = getFakeWorkerFacade()

    }
    var debug = {
        log: function() {
            if ( !! console) {
                console.log(Array.prototype.slice.call(arguments))

            }

        },
        error: function() {
            if ( !! console) {
                console.error(Array.prototype.slice.call(arguments))

            }

        }

    };
    var Helper = {
        merge: function(first, second) {
            var i = first.length,
            j = 0;
            while (second[j] !== undefined) {
                first[i++] = second[j++]

            }
            first.length = i;
            return first

        },
        extend: function(obj1, obj2) {
            for (var key in obj2) {
                obj1[key] = obj2[key]

            }
            return obj1

        }

    };
    var Position = (function() {
        var numberOfCalculations = 0,
        positions = {},
        positionCounter = -1,
        startPositionsCount = 0,
        secondSorted = false,
        calculationsInProgress = 0;
        return {
            add: function(latlng, time) {
                positionCounter += 1;
                startPositionsCount += 1;
                var pos = {
                    time: time === undefined ? options.maxWalkTime: time,
                    latlng: latlng,
                    running: false,
                    ready: false,
                    animatedOpacity: 0,
                    animatedSeconds: 0,
                    stationMap: {},
                    calculationProgress: 0,
                    doneCallback: false,
                    updateCallback: false,
                    currentTime: undefined,
                    index: positionCounter,
                    setTime: function(t) {
                        coveredArea = false;
                        this.time = t;
                        this.animatedSeconds = t

                    },
                    getTime: function() {
                        return this.time

                    },
                    startCalculation: function(doneclb, updateclb) {
                        if (this.running) {
                            if (options.calculateOnDrag) {
                                return

                            }
                            var thus = this;
                            this.killWorker()

                        }
                        this.ready = false;
                        if (canCalculate) {
                            this.running = true;
                            Event.trigger("calculationStarted", this);
                            this.calculate(doneclb, updateclb)

                        }

                    },
                    calculate: function(doneclb, updateclb) {
                        calculationsInProgress += 1;
                        coveredArea = false;
                        this.stationMap = {};
                        this.doneCallback = doneclb;
                        this.updateCallback = updateclb;
                        this.currentTime = new Date().getTime();
                        var numberOfClosest = 3,
                        minDistances = [],
                        minStations = [],
                        i = 0,
                        j,
                        nextStations = [],
                        distances = [],
                        indizes;
                        try {
                            while (i <= 1 || nextStations.length == 0) {
                                indizes = getBlockIndizesForPositionByRadius(this["latlng"], i);
                                for (j = 0; j < indizes.length; j += 1) {
                                    if (blockGrid[indizes[j][0]][indizes[j][1]].length > 0) {
                                        nextStations = Helper.merge(nextStations, blockGrid[indizes[j][0]][indizes[j][1]])

                                    }

                                }
                                i += 1;
                                if (nextStations.length > 10) {
                                    i += 1

                                }

                            }

                        } catch(e) {}
                        for (i = 0; i < nextStations.length; i++) {
                            distances.push(dotviewmap.getDistanceInKm(this["latlng"], {
                                lat: stations[nextStations[i]]["a"],
                                lng: stations[nextStations[i]]["n"]

                            }))

                        }
                        this.webworker.postMessage({
                            fromStations: nextStations,
                            blockGrid: blockGrid,
                            position: this["latlng"],
                            stations: stations,
                            lines: lines,
                            distances: distances,
                            reportInterval: options.reportInterval,
                            intervalKey: options.intervalKey,
                            maxWalkTime: options.maxWalkTime,
                            secondsPerKm: options.secondsPerKm

                        })

                    },
                    afterCalculate: function() {
                        secondSorted = false;
                        calculationsInProgress -= 1;
                        numberOfCalculations += 1;
                        if (options.animatedAreaOpacity) {
                            this.animatedOpacity = 0

                        } else {
                            this.animatedOpacity = 1

                        }
                        if (options.animateAreaGrowth) {
                            this.animatedSeconds = 0

                        } else {
                            this.animatedSeconds = this.time

                        }
                        this.running = false;
                        this.ready = true;
                        if (this.doneCallback) {
                            this.doneCallback.call(this)

                        }
                        Event.trigger("calculationDone", this)

                    },
                    createWorker: function() {
                        this.webworker = WorkerFacade(options.workerURL);
                        this.webworker.onmessage = pos.workerMessage;
                        this.webworker.onerror = pos.workerError

                    },
                    killWorker: function() {
                        this.webworker.terminate();
                        calculationsInProgress -= 1;
                        this.createWorker();
                        this.running = false

                    },
                    remove: function() {
                        if (this.running) {
                            this.killWorker()

                        }
                        this.webworker = null

                    },
                    move: function(pos, notify) {
                        this["latlng"] = {
                            lat: pos.lat,
                            lng: pos.lng

                        };
                        if (!that.inRange(pos)) {
                            this.stationMap = {};
                            return false

                        }
                        if (notify) {
                            Event.trigger("positionMoved", this)

                        }
                        return true

                    },
                    draw: function(ctx, pos, stationId, pixelPerSecond, fullpath, prefunc) {
                        if (stationId) {
                            if (this.stationMap[stationId] == undefined) {
                                return

                            }
                            if (this.stationMap[stationId] >= this.animatedSeconds) {
                                return

                            }

                        }
                        pos = pos || {
                            lat: this["latlng"].lat,
                            lng: this["latlng"].lng

                        };
                        if (!fullpath && !options.intersection) {
                            ctx.beginPath()

                        }
                        var reachableIn = !!stationId ? this.stationMap[stationId] : 0;
                        var secs = Math.min((this.animatedSeconds - reachableIn), options.maxWalkTime);
                        var radius = Math.max(secs * pixelPerSecond, 1);
                        var nxy = dotviewmap.getCanvasXY(pos);
                        if (prefunc) {
                            prefunc(ctx, pos, reachableIn, secs, nxy, radius)

                        }
                        ctx.moveTo(nxy.x, nxy.y);
                        ctx.arc(nxy.x, nxy.y, radius, 0, dotviewmap.env.circleRadians, true);
                        if (!fullpath && !options.intersection) {
                            ctx.fill()

                        }

                    }

                };
                pos.workerMessage = function(event) {
                    if (event.data.status == "done") {
                        pos.stationMap = event.data.stationMap;
                        pos.afterCalculate()

                    } else {
                        if (event.data.status == "working") {
                            pos.calculationProgress = event.data.at;
                            if (pos.updateCallback) {
                                pos.updateCallback.call(pos, event.data.at)

                            }
                            Event.trigger("calculationUpdated", pos)

                        }

                    }

                };
                pos.workerError = function(error) {
                    debug.error(pos, "Worker: " + error.message, error);
                    throw error

                };
                pos.createWorker();
                positions[positionCounter] = pos;
                return pos

            },
            remove: function(index) {
                if (!positions[index]) {
                    return false

                }
                startPositionsCount -= 1;
                secondSorted = false;
                positions[index]["remove"]();
                delete positions[index];
                Event.trigger("positionRemoved", index);
                return true

            },
            calculateAll: function() {
                for (var index in positions) {
                    positions[index]["startCalculation"]()

                }

            },
            killAll: function() {
                for (var index in positions) {
                    positions[index]["killWorker"]()

                }

            },
            calculateNeeded: function() {
                for (var index in positions) {
                    if (!positions[index].ready && !positions[index].running) {
                        positions[index]["startCalculation"]()

                    }

                }

            },
            draw: function(ctx, fullpath) {
                var count = 0;
                var pixPerSeconds = (1 / options.secondsPerKm) * options.pixelPerKm;
                for (var index in positions) {
                    var pos = positions[index];
                    if (!pos.ready) {
                        continue

                    }
                    ctx.fillStyle = options.drawColor;
                    if (count == 1 && options.intersection) {
                        ctx.globalCompositeOperation = "destination-in"

                    }
                    ctx.beginPath();
                    pos.draw(ctx, null, null, pixPerSeconds, true);
                    if (!fullpath && !options.intersection) {
                        ctx.fill()

                    }
                    for (var i = 0; i < stationList.length; i++) {
                        var stationId = stationList[i];
                        var station = stations[stationId];
                        if (station.a === undefined) {
                            continue

                        }
                        pos.draw(ctx, {
                            lat: station.a,
                            lng: station.n

                        },
                        stationId, pixPerSeconds, fullpath)

                    }
                    if (fullpath || options.intersection) {
                        ctx.fill()

                    }
                    count += 1

                }

            },
            getFastestStationsWithIndex: function() {
                var sml = [];
                for (var i = 0; i < stationList.length; i++) {
                    var smallestIndex = false,
                    smallestSecond = Infinity;
                    for (var index in positions) {
                        if (typeof(positions[index].stationMap[stationList[i]]) !== "undefined" && positions[index].stationMap[stationList[i]] < smallestSecond) {
                            smallestSecond = positions[index].stationMap[stationList[i]];
                            smallestIndex = index

                        }

                    }
                    if (smallestIndex !== false) {
                        sml.push([smallestIndex, smallestSecond, stationList[i]])

                    }

                }
                return sml

            },
            drawColor: function(ctx) {
                if (secondSorted == false) {
                    secondSorted = this.getFastestStationsWithIndex();
                    secondSorted.sort(function(a, b) {
                        return ((a[1] < b[1]) ? -1: ((a[1] > b[1]) ? 1: 0))

                    })

                }
                var pixPerSeconds = (1 / options.secondsPerKm) * options.pixelPerKm;
                var addSecondGradient = function(ctx, pos, seconds, secs, nxy, radius) {
                    var grad = ctx.createRadialGradient(nxy.x, nxy.y, 0, nxy.x, nxy.y, radius);
                    grad.addColorStop(0, getColorFor(seconds));
                    grad.addColorStop(0.5, getColorFor(Math.floor(seconds + (secs / 2))));
                    grad.addColorStop(1, getColorFor(seconds + secs));
                    ctx.fillStyle = grad

                };
                for (var i = (secondSorted.length - 1); i >= 0; i--) {
                    var stationId = secondSorted[i][2];
                    var index = secondSorted[i][0];
                    var station = stations[stationId];
                    if (station.a == undefined) {
                        continue

                    }
                    if (positions[index].stationMap[stationId] > secondSorted[i][1]) {
                        continue

                    }
                    ctx.beginPath();
                    positions[index].draw(ctx, {
                        lat: station.a,
                        lng: station.n

                    },
                    stationId, pixPerSeconds, false, addSecondGradient);
                    ctx.fill()

                }

            },
            getCalculationsInProgress: function() {
                return calculationsInProgress

            },
            getStationMapData: function() {
                var d = [];
                for (var index in positions) {
                    d.push(positions[index].stationMap)

                }
                return d

            }

        }

    } ());
    that.getStationMapData = Position.getStationMapData;
    that.search = (function(that) {
        var UnionFind = function() {
            var num_weights = {},
            parent_pointers = {},
            num_to_objects = {},
            objects_to_num = {},
            object_num = 0;
            return {
                insertObjects: function(objects) {
                    for (var i = 0; i < objects.length; i++) {
                        this.find(objects[i])

                    }

                },
                find: function(object) {
                    if (objects_to_num[object] === undefined) {
                        num_weights[object_num] = 1;
                        objects_to_num[object] = object_num;
                        num_to_objects[object_num] = object;
                        parent_pointers[object_num] = object_num;
                        object_num += 1;
                        return object

                    }
                    var stk = [objects_to_num[object]];
                    var par = parent_pointers[stk[stk.length - 1]];
                    while (par != stk[stk.length - 1]) {
                        stk.push(par);
                        par = parent_pointers[par]

                    }
                    for (var i = 0; i < stk.length; i++) {
                        parent_pointers[stk[i]] = par

                    }
                    return num_to_objects[par]

                },
                union: function(object1, object2) {
                    var o1p = this.find(object1);
                    var o2p = this.find(object2);
                    if (o1p != o2p) {
                        var on1 = objects_to_num[o1p];
                        var on2 = objects_to_num[o2p];
                        var w1 = num_weights[on1];
                        var w2 = num_weights[on2];
                        if (w1 < w2) {
                            var tmp;
                            tmp = o2p;
                            o2p = o1p;
                            o1p = tmp;
                            tmp = on2;
                            on2 = on1;
                            on1 = tmp;
                            tmp = w2;
                            w2 = w1;
                            w1 = tmp

                        }
                        num_weights[on1] = w1 + w2;
                        delete num_weights[on2];
                        parent_pointers[on2] = on1

                    }

                },
                getRegions: function() {
                    var sets = {},
                    i;
                    for (i = 0; i < object_num; i++) {
                        sets[i] = []

                    }
                    for (i in objects_to_num) {
                        sets[objects_to_num[this.find(i)]].push(i)

                    }
                    var out = [];
                    for (i in sets) {
                        if (sets[i].length > 0) {
                            out.push(sets[i])

                        }

                    }
                    return out

                }

            }

        };
        return {
            detectBlobs: function() {
                var image = that.getImageData();
                var labels = {};
                var pix = image.data;
                var w = image.width;
                var h = image.height;
                var regionCounter = 0;
                var uf = UnionFind();
                var colorCheck;
                if (that.getOption("color")) {
                    colorCheck = function(x) {
                        return x !== 0

                    }

                } else {
                    colorCheck = function(x) {
                        return x === 0

                    }

                }
                for (var j = 0; j < h; j++) {
                    for (var i = 0; i < w; i++) {
                        var current = i * 4 + j * w * 4 + 3;
                        if (colorCheck(pix[current])) {
                            if (colorCheck(pix[current - 4]) && colorCheck(pix[current - (w * 4)])) {
                                if (uf.find(current - 4) === uf.find(current - (w * 4))) {
                                    uf.find(current);
                                    uf.union(current, current - 4)

                                } else {
                                    uf.union(current - 4, current - (w * 4));
                                    uf.find(current);
                                    uf.union(current, current - 4)

                                }

                            } else {
                                if (colorCheck(pix[current - 4])) {
                                    uf.find(current);
                                    uf.union(current, current - 4)

                                } else {
                                    if (colorCheck(pix[current - (w * 4)])) {
                                        uf.find(current);
                                        uf.union(current, current - (w * 4))

                                    } else {
                                        uf.find(current)

                                    }

                                }

                            }

                        }

                    }

                }
                var regions = uf.getRegions();
                var blobs = [];
                for (i = 0; i < regions.length; i++) {
                    var maxx = -Infinity,
                    maxy = -Infinity,
                    minx = Infinity,
                    miny = Infinity;
                    var sumx = 0,
                    sumy = 0;
                    var points = [];
                    for (j = 0; j < regions[i].length; j++) {
                        var point = parseInt(regions[i][j], 10);
                        var y = Math.floor(((point - 3) / 4) / w);
                        var x = ((point - 3) / 4) % w;
                        maxx = Math.max(x, maxx);
                        maxy = Math.max(y, maxy);
                        minx = Math.min(x, minx);
                        miny = Math.min(y, miny);
                        sumx += x;
                        sumy += y;
                        points.push([x, y])

                    }
                    var midx = sumx / regions[i].length;
                    var midy = sumy / regions[i].length;
                    blobs.push({
                        points: points,
                        maxx: maxx,
                        minx: minx,
                        maxy: maxy,
                        miny: miny,
                        midx: midx,
                        midy: midy,
                        sum: regions[i].length,
                        sqkm: that.numberOfPixelsToSqkm(points.length),
                        midgeo: dotviewmap.getCanvasXY(midx, midy)

                    })

                }
                return blobs

            }

        }

    } (that));
    that.addPosition = function(latlng, time) {
        if (!that.inRange({
            lat: latlng.lat,
            lng: latlng.lng

        })) {
            return false

        }
        return Position.add(latlng, time)

    };
    that.inRange = function(pos) {
        if (pos.lat > options.northwest["lat"] || pos.lat < options.southeast["lat"] || pos.lng < options.northwest["lng"] || pos.lng > options.southeast["lng"]) {
            return false

        }
        return true

    };
    that.getCalculationsInProgress = function() {
        return Position.getCalculationsInProgress()

    };
    var getBlockIndizesForPosition = function(lat, lng) {
        var indexX = Math.floor((options.widthInKm / options.latLngDiffs["lng"] * (lng - options.northwest["lng"])) / blockSize);
        var indexY = Math.floor((options.heightInKm / options.latLngDiffs["lat"] * (options.northwest["lat"] - lat)) / blockSize);
        return [indexX, indexY]

    };
    var getAlternativeBlockIndizesForPosition = function(lat, lng) {
        var indexX = Math.floor(dotviewmap.getDistanceInKm(pos, {
            lat: lat,
            lng: options.northwest["lng"]

        }) / blockSize);
        var indexY = Math.floor(dotviewmap.getDistanceInKm(pos, {
            lat: options.northwest["lat"],
            lng: lng

        }) / blockSize);
        return [indexX, indexY]

    };
    var getBlockIndizesForPositionByRadius = function(pos, rad, all) {
        var indizes = getBlockIndizesForPosition(pos.lat, pos.lng);
        if (rad === 0) {
            return [indizes]

        }
        var results = [],
        nearestObjects = [],
        start,
        maxDistanceToEdge,
        nx,
        ny;
        if ( !! all) {
            start = 0

        } else {
            start = rad

        }
        var i = start;
        for (var j = -i; j < (i + 1); j++) {
            nx = indizes[0] - i;
            ny = indizes[1] + j;
            if (nx >= 0 && ny < blockCountY && ny > 0) {
                results.push([nx, ny])

            }
            nx = indizes[0] + i;
            ny = indizes[1] + j;
            if (nx < blockCountX && ny < blockCountY && ny > 0) {
                results.push([nx, ny])

            }
            if (j > -i && j < i) {
                nx = indizes[0] + j;
                ny = indizes[1] - i;
                if (nx < blockCountX && nx > 0 && ny >= 0) {
                    results.push([nx, ny])

                }
                nx = indizes[0] + j;
                ny = indizes[1] - i;
                if (nx < blockCountX && nx > 0 && ny >= 0) {
                    results.push([nx, ny])

                }

            }

        }
        return results

    };
    that.setOption = function(key, value) {
        options[key] = value

    };
    that.setOptions = function(opts) {
        Helper.extend(options, opts)

    };
    that.getOption = function(key) {
        return options[key]

    };
    that.getDefaultOption = function(key) {
        return localDefault[key]

    };
    that.hasOptionChanged = function(key) {
        return options[key] === localDefault[key]

    };
    that.getTitle = function() {
        return "Urban Distance"

    };
    that.bind = function(name, fnc) {
        Event.bind(name, fnc)

    };
    that.unbind = function(name, fnc) {
        Event.unbind(name, fnc)

    };
    that.getCoveredArea = function() {
        if (coveredArea === false) {
            var image = that.getImageData();
            var pix = image.data;
            var w = image.width;
            var h = image.height;
            var tmp = 0;
            for (var j = 0; j < h; j++) {
                for (var i = 0; i < w; i++) {
                    if (pix[i * 4 + j * w * 4 + 3] === 0) {
                        tmp += 1

                    }

                }

            }
            coveredArea = tmp

        }
        return coveredArea

    };
    that.getImageData = function() {
        if (!imageData) {
            imageData = dotviewmap.ctx.getImageData(0, 0, dotviewmap.canvas.width, dotviewmap.canvas.height)

        }
        return imageData

    };
    that.isHighlighted = function(x, y) {
        var image = that.getImageData();
        x = Math.floor(x);
        y = Math.floor(y);
        var trans = image.data[((y * (image.width * 4)) + (x * 4)) + 3];
        if (that.getOption("color")) {
            return trans !== 0

        } else {
            return trans === 0

        }

    };
    that.getDrawingLevel = function() {
        return 0

    };
    that.setup = function(controlcontainer, userOptions) {
        for (var key in userOptions) {
            options[key] = userOptions[key]

        }
        options.reportInterval = Math.round(options.estimatedMaxCalculateCalls / 20);
        options.southwest = {
            lat: options.southeast["lat"],
            lng: options.northwest["lng"]

        };
        options.northeast = {
            lat: options.northwest["lat"],
            lng: options.southeast["lng"]

        };
        options.latLngDiffs = {
            lat: Math.abs(options.northwest["lat"] - options.southeast["lat"]),
            lng: Math.abs(options.northwest["lng"] - options.southeast["lng"])

        };
        options.widthInKm = dotviewmap.getDistanceInKm(options.northwest, options.northeast);
        options.heightInKm = dotviewmap.getDistanceInKm(options.northwest, options.southwest);
        blockCountX = Math.ceil(options.widthInKm / blockSize);
        blockCountY = Math.ceil(options.heightInKm / blockSize);
        that.calculatePixelPerKm();
        dotviewmap.bind("zoom", that.calculatePixelPerKm);
        Event.trigger("setup", that);
        startLoading()

    };
    that.calculatePixelPerKm = function() {
        options.southeastxy = dotviewmap.getDivXY(options.southeast);
        options.northwestxy = dotviewmap.getDivXY(options.northwest);
        options.southwestxy = dotviewmap.getDivXY(options.southwest);
        options.northeastxy = dotviewmap.getDivXY(options.northeast);
        options.map_width = Math.abs(options.southwestxy["x"] - options.northeastxy["x"]);
        options.map_height = Math.abs(options.southwestxy["y"] - options.northeastxy["y"]);
        options.pixelPerKm = options.map_width / options.widthInKm

    };
    that.numberOfPixelsToSqkm = function(numpix) {
        return Math.round(numpix * ((1 / options.pixelPerKm) * (1 / options.pixelPerKm)) * 100) / 100

    };
    that.removePosition = function(index) {
        Position.remove(index)

    };
    var loadFromCache = function() {
        var data;
        if ( !! localStorage) {
            try {
                data = localStorage.getItem(options.cityData)

            } catch(e) {
                return false

            }
            if (data != null) {
                try {
                    data = JSON.parse(data);
                    stations = data[0];
                    lines = data[1]

                } catch(e) {
                    return false

                }
                dataLoaded(true);
                return true

            }

        }
        return false

    };
    var startLoading = function() {
        if (!loadFromCache()) {
            loadDataPart(1)

        }

    };
    var loadDataPart = function(index) {
        loadDataScript(options.dataUrlPrefix + options.cityData + "-" + index + ".json", 
        function() {
            loadPartComplete(index)

        })

    };
    var loadPartComplete = function(index) {
        var data = dotviewmap.getLayerData(that.idname, index - 1);
        if ( !! data[2]) {
            stations = Helper.extend(stations, data[2])

        }
        if ( !! data[3]) {
            lines = Helper.extend(lines, data[3])

        }
        var percent = Math.round(data[0] / data[1] * 100);
        if (data[0] < data[1]) {
            Event.trigger("loadProgress", percent);
            loadDataPart(data[0] + 1)

        } else {
            Event.trigger("loadProgress", percent);
            window.setTimeout(function() {
                dataLoaded()

            },
            100)

        }

    };
    var loadDataScript = function(url, callback, errback) {
        var script = document.createElement("SCRIPT");
        script.type = "text/javascript";
        script.async = "true";
        script.src = url;
        if (errback) {
            script.onerror = errback

        }
        script.onload = callback;
        document.getElementsByTagName("head")[0].appendChild(script)

    };
    var dataLoaded = function(fromCache) {
        if (fromCache === undefined && !!localStorage) {
            try {
                localStorage.clear();
                localStorage.setItem(options.cityData, JSON.stringify([stations, lines]))

            } catch(e) {}

        }
        blockGrid = [];
        for (var j = 0; j <= blockCountX; j += 1) {
            blockGrid.push([]);
            for (var k = 0; k <= blockCountY; k += 1) {
                blockGrid[j].push([])

            }

        }
        stationList = [];
        for (var stationId in stations) {
            stationList.push(stationId);
            var indizes = getBlockIndizesForPosition(stations[stationId]["a"], stations[stationId]["n"]);
            blockGrid[indizes[0]][indizes[1]].push(stationId)

        }
        canCalculate = true;
        Position.calculateNeeded();
        Event.trigger("dataLoaded", that)

    };
    var getColorFor = function(secs) {
        min = Math.floor(secs / 60);
        if (min == 0) {
            min = 1

        }
        if (colorCache[min] === undefined) {
            colorCache[min] = "hsla(" + (options.colorBaseGradientColor - Math.floor(min / options.colorMaxAcceptableTime * (options.colorBaseGradientColor + options.colorMaxGradientColor))) + ", 100%, 50%, 0.75)"

        }
        return colorCache[min]

    };
    var fillGreyArea = function(ctx) {
        if (options.intersection) {
            ctx.globalCompositeOperation = "source-out"

        } else {
            ctx.globalCompositeOperation = "source-over"

        }
        if (dotviewmap.map.getMapTypeId() === "Night") {
            options.darkOverlayColor = "rgba(0,0,0,0.8)"

        } else {
            if (options.dayTimeEnabled) {
                if (options.intervalKey[1] === "0" || options.intervalKey[1] === "4") {
                    options.darkOverlayColor = "rgba(0,0,0,0.8)"

                } else {
                    options.darkOverlayColor = localDefault.darkOverlayColor

                }

            }

        }
        ctx.fillStyle = options.darkOverlayColor;
        ctx.fillRect(0, 0, dotviewmap.canvas.width, dotviewmap.canvas.height)

    };
    var drawBounds = function(ctx, light) {
        ctx.save();
        ctx.globalAlpha = 0.7;
        if (!light) {
            ctx.strokeStyle = "#333"

        } else {
            ctx.strokeStyle = "#fff"

        }
        ctx.lineWidth = 1;
        ctx.beginPath();
        var nwxy = dotviewmap.getCanvasXY(options.northwest),
        nexy = dotviewmap.getCanvasXY(options.northeast),
        sexy = dotviewmap.getCanvasXY(options.southeast),
        swxy = dotviewmap.getCanvasXY(options.southwest);
        ctx.moveTo(nwxy.x, nwxy.y);
        ctx.lineTo(nexy.x, nexy.y);
        ctx.lineTo(sexy.x, sexy.y);
        ctx.lineTo(swxy.x, swxy.y);
        ctx.lineTo(nwxy.x, nwxy.y);
        ctx.stroke();
        ctx.restore()

    };
    var redrawTransparent = function(ctx) {
        if (!options.intersection) {
            fillGreyArea(ctx);
            drawBounds(ctx);
            ctx.globalCompositeOperation = "destination-out"

        } else {
            ctx.globalCompositeOperation = "source-over"

        }
        var fullpath = options.isOpera ? true: false;
        Position.draw(ctx, fullpath);
        if (options.intersection) {
            fillGreyArea(ctx)

        }

    };
    that.calculateAll = function() {
        Position.calculateAll()

    };
    var redrawColor = function(ctx) {
        drawBounds(ctx, true);
        Position.drawColor(ctx);
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.globalCompositeOperation = "destination-out";
        ctx.fillStyle = "rgba(255,255,255,1)";
        ctx.fillRect(0, 0, dotviewmap.canvas.width, dotviewmap.canvas.height);
        ctx.restore()

    };
    that.redraw = function(ctx) {
        imageData = null;
        ctx.save();
        if (options.color) {
            redrawColor(ctx)

        } else {
            redrawTransparent(ctx)

        }
        ctx.restore()

    };
    that.destroy = function() {
        Position.killAll()

    };
    return that

});
var UrbanDistanceUI = function(dotviewmap, that, $, window, undefined) {
    var startPositions = {},
    startPositionsCount = 0,
    idname = that.idname,
    geocoder = new google.maps.Geocoder(),
    lastStartPositionIndex,
    highlightedIconUrl = "http://gmaps-samples.googlecode.com/svn/trunk/markers/green/blank.png",
    normalIconUrl = "http://gmaps-samples.googlecode.com/svn/trunk/markers/orange/blank.png";
    var options = {
        darkOverlayColorDay: "rgba(50,50,50,0.4)",
        darkOverlayColorNight: "rgba(0,0,0,0.7)"

    };
    that.bind("setup", 
    function() {
        $("#" + idname + "-loading").show().progressbar({
            value: 0

        });
        appendControlHtmlTo();
        $.address.externalChange(hashChange);
        displayPendingLoad(false);
        $("#" + idname + "-loading").progressbar("value", 0)

    });
    that.bind("loadProgress", 
    function(progress) {
        $("#" + idname + "-loading").progressbar("value", progress);
        if (progress >= 100) {
            displayPendingLoad(true)

        }

    });
    that.bind("dataLoaded", 
    function() {
        $("#" + idname + "-loading").hide();
        hashChange({
            setup: true,
            parameters: $.address.parameters()

        });
        var pos;
        if (startPositionsCount === 0) {
            pos = addPosition(that.getOption("defaultStartAtPosition"))

        } else {
            if (lastStartPositionIndex !== undefined) {
                pos = startPositions[lastStartPositionIndex].position

            }

        }
        if (pos) {
            openPositionWindow(pos.index)()

        }
        window.setTimeout(function() {
            $("#controls").animate({
                bottom: "20px",
                right: "-5px"

            },
            1500)

        },
        500)

    });
    that.bind("positionMoved", 
    function(pos) {
        pos.startCalculation();
        updatePositionHash(pos.index);
        startPositions[pos.index].latlng = pos.latlng;
        moveMarkerTo(startPositions[pos.index].marker, pos.latlng);
        getAddressForPoint(pos.latlng, setAddressForPosition(pos));
        updatePositionHash(pos.index)

    });
    that.bind("positionRemoved", 
    function(index) {
        startPositionsCount -= 1;
        if (startPositionsCount == 0) {
            $("#" + idname + "-positionContainer").text("Drag a marker from the top bar onto the map!")

        }
        $("#" + idname + "-" + index).remove();
        startPositions[index].infowindow.close();
        removeMarker(startPositions[index].marker);
        $.address.deleteParameters(["lat" + index, "lng" + index, "t" + index]);
        delete startPositions[index];
        dotviewmap.trigger("redraw")

    });
    that.bind("calculationStarted", 
    function(position) {
        var index = position.index;
        startPositions[index].calculating = true;
        if (that.getOption("calculateOnDrag")) {
            return

        }
        $("#" + idname + "-" + index + "-slider").hide();
        $("#" + idname + "-" + index + "-progressbar").find(".ui-progressbar-value").css("background", "");
        $("#" + idname + "-" + index + "-info").css("visibility", "hidden");
        $("#" + idname + "-" + index + "-progressbar").show();
        highlightPositionArea(index)

    });
    that.bind("calculationDone", 
    function(position) {
        var index = position.index;
        startPositions[index].calculating = false;
        $("#" + idname + "-" + index + "-progressbar").hide();
        $("#" + idname + "-" + index + "-progressbar").progressbar("value", 0);
        $("#" + idname + "-" + index + "-info").css("visibility", "visible");
        $("#" + idname + "-" + index + "-slider").show();
        window.setTimeout(function() {
            unhighlightPositionArea(index);
            if (that.getCalculationsInProgress() > 0) {
                highlightPositionArea()

            }

        },
        3000);
        dotviewmap.trigger("redraw");
        searchArea()

    });
    that.bind("calculationUpdated", 
    function(position) {
        var index = position.index;
        var count = position.calculationProgress;
        var max = that.getOption("estimatedMaxCalculateCalls") || 100000;
        that.calculationLoopCount = count;
        if (that.getOption("calculateOnDrag")) {
            return

        }
        var percent = count / max * 100;
        if (percent > 99) {
            percent = 99

        }
        if (count > max + that.getOption("reportInterval")) {
            $("#" + idname + "-" + index + "-progressbar").find(".ui-progressbar-value").css("background", "url(/media/img/loading.gif) 40% center no-repeat")

        }
        $("#" + idname + "-" + index + "-progressbar").progressbar("value", percent)

    });
    google.maps.event.addListener(dotviewmap.map, "dragend", 
    function() {
        updateMapPositionAndZoom()

    });
    google.maps.event.addListener(dotviewmap.map, "zoom_changed", 
    function() {
        updateMapPositionAndZoom()

    });
    var updateMapPositionAndZoom = function(setnow, lat, lng, zoom) {
        if (setnow) {
            if (lat !== undefined && lng !== undefined) {
                dotviewmap.map.setCenter(new google.maps.LatLng(parseFloat(lat), parseFloat(lng)))

            }
            if (zoom !== undefined) {
                dotviewmap.map.setZoom(parseInt(zoom, 10))

            }

        } else {
            var center = dotviewmap.map.getCenter();
            var mapzoom = dotviewmap.map.getZoom();
            $.address.parameterMap({
                lat: center.lat(),
                lng: center.lng(),
                zoom: mapzoom

            })

        }

    };
    var updateCoveredArea = function() {
        var numpix = that.getCoveredArea();
        jQuery("#" + that.idname + "-coveredarea").text(numpix + " Pixel ~ " + that.numberOfPixelsToSqkm(numpix) + " sqkm")

    };
    var createMarker = function(pos, options) {
        options = options || {};
        options.position = new google.maps.LatLng(pos.lat, pos.lng);
        options.map = dotviewmap.map;
        options.title = "";
        var marker = new google.maps.Marker(options);
        return marker

    };
    var addEventOnMarker = function(ev, marker, func) {
        google.maps.event.addListener(marker, ev, func)

    };
    var removeMarker = function(marker) {
        marker.setMap(null)

    };
    var moveMarkerTo = function(marker, pos) {
        marker.setPosition(new google.maps.LatLng(pos.lat, pos.lng))

    };
    var getPointForAddress = function(address, userCallback) {
        var callback = function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                userCallback(results[0].geometry.location)

            }

        };
        geocoder.geocode({
            address: address

        },
        callback)

    };
    var getAddressForPoint = function(latlng, userCallback) {
        var callback = function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                userCallback(results[0].formatted_address)

            }

        };
        geocoder.geocode({
            latLng: new google.maps.LatLng(latlng.lat, latlng.lng)

        },
        callback)

    };
    var setPosition = function(pos, index) {
        startPositions[index].position.move(pos, true);
        startPositions[index].latlng = {
            lat: pos.lat,
            lng: pos.lng

        }

    };
    var addPosition = function(latlng, time) {
        var position = that.addPosition(latlng, time);
        if (position === false) {
            showMessage("Your point is out of the covered area.");
            dotviewmap.trigger("redraw");
            return false

        }
        var index = position.index;
        startPositionsCount += 1;
        lastStartPositionIndex = index;
        var marker = createMarker(latlng, {
            draggable: true

        });
        marker.setZIndex(800);
        marker.setIcon(normalIconUrl);
        startPositions[index] = {
            marker: marker,
            latlng: latlng,
            time: position.time,
            calculating: false,
            address: "Loading...",
            infowindow: new google.maps.InfoWindow({
                content: '<div style="height:110px;margin:8px 0px"><h3>Drag the pin around!</h3><p>Currently at: <span class="' + idname + "-" + index + '-address">Address Loading...<br/></span></p><h3>Or go to an address:</h3><form id="' + idname + "-" + index + '-addressinputform"><input type="text" id="' + idname + "-" + index + '-addressinput" placeholder="Type address here" size="30"/><input type="submit" value="Go"/></form></div>',
                maxWidth: 250

            }),
            position: position,
            lock: false

        };
        google.maps.event.addListener(startPositions[index].infowindow, "domready", 
        function() {
            $("." + idname + "-" + index + "-address").text(startPositions[index].address);
            $("#" + idname + "-" + index + "-addressinputform").submit(function(e) {
                e.preventDefault();
                getPointForAddress($("#" + idname + "-" + index + "-addressinput").val(), 
                function(latlng) {
                    if (that.inRange({
                        lat: latlng.lat(),
                        lng: latlng.lng()

                    })) {
                        position.move({
                            lat: latlng.lat(),
                            lng: latlng.lng()

                        },
                        true);
                        dotviewmap.map.panTo(latlng)

                    } else {
                        moveMarkerTo(startPositions[position.index].marker, position.latlng);
                        showMessage("Your point is out of the covered area.");
                        dotviewmap.trigger("redraw")

                    }

                })

            })

        });
        getAddressForPoint(latlng, setAddressForPosition(position));
        addEventOnMarker("click", marker, openPositionWindow(index));
        addEventOnMarker("mouseover", marker, highlightMarker(index));
        addEventOnMarker("mouseout", marker, unhighlightMarker(index));
        addEventOnMarker("dragstart", marker, 
        function() {
            setAddressForPosition(position)("?");
            startPositions[index].infowindow.close()

        });
        if (that.getOption("calculateOnDrag")) {
            addEventOnMarker("drag", marker, 
            function(mev) {
                if (position.move({
                    lat: mev.latLng.lat(),
                    lng: mev.latLng.lng()

                },
                false)) {
                    position.startCalculation()

                }

            })

        }
        addEventOnMarker("dragend", marker, 
        function(mev) {
            if (that.inRange({
                lat: mev.latLng.lat(),
                lng: mev.latLng.lng()

            })) {
                position.move({
                    lat: mev.latLng.lat(),
                    lng: mev.latLng.lng()

                },
                true)

            } else {
                moveMarkerTo(startPositions[position.index].marker, position.latlng);
                showMessage("Your point is out of the covered area.");
                dotviewmap.trigger("redraw")

            }

        });
        updatePositionHash(index);
        addPositionHtml(index);
        position.startCalculation();
        return position

    };
    var removePosition = function(index) {
        that.removePosition(index)

    };
    var updateGoby = function(e) {
        var newMaxWalkTime,
        newSecondsPerKm;
        try {
            newMaxWalkTime = parseInt($("#" + idname + "-gotime").val(), 10) * 60

        } catch(e) {
            return

        }
        var biking = $("#" + idname + "-gobybike").is(":checked");
        if (biking) {
            newSecondsPerKm = that.getOption("secondsPerKmBiking")

        } else {
            newSecondsPerKm = that.getOption("secondsPerKmWalking")

        }
        if (newSecondsPerKm != that.getOption("secondsPerKm") || newMaxWalkTime != that.getOption("maxWalkTime")) {
            that.setOption("secondsPerKm", newSecondsPerKm);
            that.setOption("maxWalkTime", newMaxWalkTime);
            var remove = [],
            add = {};
            if (that.getOption("secondsPerKm") === that.getOption("secondsPerKmWalking")) {
                remove.push("bike")

            } else {
                add.bike = "true"

            }
            if (that.hasOptionChanged("maxWalkTime")) {
                remove.push("maxWalkTime")

            } else {
                add.maxWalkTime = Math.ceil(that.getOption("maxWalkTime") / 60)

            }
            $.address.updateParameters(add, remove);
            that.calculateAll()

        }

    };
    var updateSlider = function(index) {
        return function(e, ui) {
            setSecondsForPosition(ui.value * 60, index);
            $.address.parameter("t" + index, ui.value)

        }

    };
    var setSecondsForPosition = function(seconds, index) {
        if (startPositions[index].lock) {
            return

        }
        startPositions[index].lock = true;
        startPositions[index].time = seconds;
        startPositions[index].position.setTime(seconds);
        dotviewmap.trigger("redraw");
        $("#" + idname + "-" + index + "-timeSpan").text(Math.round(seconds / 60));
        $("#" + idname + "-" + index + "-slider").slider("value", Math.round(seconds / 60));
        startPositions[index].lock = false

    };
    var setOptions = function(opts) {
        var recalc = false;
        var speed = that.getOption("secondsPerKmWalking");
        if (opts.bike) {
            $("#" + idname + "-gobybike").attr("checked", "checked");
            speed = that.getOption("secondsPerKmBiking")

        } else {
            $("#" + idname + "-gobybike").attr("checked", "")

        }
        if (that.getOption("secondsPerKm") != speed) {
            recalc = true

        }
        that.setOption("secondsPerKm", speed);
        if (that.getOption("maxWalkTime") != opts.maxWalkTime) {
            recalc = true

        }
        that.setOption("maxWalkTime", opts.maxWalkTime);
        $("#" + idname + "-gotime").val(Math.round(opts.maxWalkTime / 60));
        setColor(opts.color);
        setIntersection(opts.intersection);
        return recalc

    };
    var setColor = function(colrd) {
        that.setOption("color", colrd);
        if (colrd) {
            $("#" + idname + "-color").attr("checked", "checked");
            if ($("#" + idname + "-intersection").is(":checked")) {
                $("#" + idname + "-intersection").attr("checked", null);
                that.setOption("intersection", false)

            }

        } else {
            $("#" + idname + "-color").attr("checked", null)

        }

    };
    var setSecondsForIndex = function(seconds, index) {
        startPositions[index].position.setTime(seconds);
        startPositions[index].time = seconds;
        dotviewmap.trigger("redraw")

    };
    var setIntersection = function(intersct) {
        if (!dotviewmap.env.hasCompositing) {
            if (intersct) {
                showMessage("This browser does not support intersections! Try Firefox or Opera.")

            }
            return

        }
        that.setOption("intersection", intersct);
        if (intersct) {
            $("#" + idname + "-intersection").attr("checked", "checked")

        } else {
            $("#" + idname + "-intersection").attr("checked", null)

        }
        if (intersct && startPositionsCount < 2) {
            showMessage("You need at least two points to see an intersection!")

        }
        if (intersct && $("#" + idname + "-color").is(":checked")) {
            $("#" + idname + "-color").attr("checked", null);
            that.setOption("color", false)

        }

    };
    var updateOptionsHash = function() {
        if (that.getOption("color")) {
            $.address.parameter("color", "true")

        } else {
            $.address.deleteParameters(["color"])

        }
        if (that.getOption("intersection")) {
            $.address.parameter("intersection", "true")

        } else {
            $.address.deleteParameters(["intersection"])

        }

    };
    var dayTimeChanged = function() {
        var day = "m";
        if ($("#" + idname + "-daytime-day-sat").is(":checked")) {
            day = "a"

        } else {
            if ($("#" + idname + "-daytime-day-sun").is(":checked")) {
                day = "u"

            }

        }
        var ind = Math.floor($("#" + idname + "-daytimeslider").slider("value") / 100);
        if (that.getDefaultOption("intervalKey") != day + ind) {
            $.address.parameter("dayTime", day + ind)

        } else {
            $.address.deleteParameters(["dayTime"])

        }
        if (setDayTime(day + ind)) {
            that.calculateAll()

        }
        dotviewmap.trigger("redraw")

    };
    var setDayTime = function(dt) {
        if (!that.getOption("dayTimeEnabled")) {
            return false

        }
        var recalc = false;
        var setSlider = false;
        if (that.getOption("intervalKey") !== dt) {
            recalc = true

        }
        that.setOption("intervalKey", dt);
        $("#" + idname + "-daytime-day-mon").attr("checked", null);
        $("#" + idname + "-daytime-day-sat").attr("checked", null);
        $("#" + idname + "-daytime-day-sun").attr("checked", null);
        var day = "mon";
        if (dt[0] === "a") {
            day = "sat"

        } else {
            if (dt[0] === "u") {
                day = "sun"

            }

        }
        $("#" + idname + "-daytime-day-" + day).attr("checked", "checked");
        var ind = parseInt(dt[1], 10);
        var time = ind * 100;
        if (ind === 0 || ind === 4) {
            dotviewmap.setNightTime();
            that.setOption("darkOverlayColor", options.darkOverlayColorNight)

        } else {
            dotviewmap.setDayTime();
            that.setOption("darkOverlayColor", options.darkOverlayColorDay)

        }
        var dayTimeSliderPos = $("#" + idname + "-daytimeslider").slider("value");
        var checkValue = Math.floor(dayTimeSliderPos / 100);
        if (checkValue != ind) {
            $("#" + idname + "-daytimeslider").slider("value", time)

        }
        return recalc

    };
    var appendControlHtmlTo = function() {
        container = $("#controls");
        container.html('<div id="' + idname + '-positionContainer" class="positions"></div><div class="dataloading" id="' + idname + '-loading"></div>');
        if ($.browser.webkit) {
            $("#clear-search").hide()

        }
        $("#" + idname + "-search").change(searchArea);
        $("#" + idname + "-search").click(searchArea);
        $("#" + idname + "-search").keydown(function(e) {
            if (searchTypeTimeout !== false) {
                window.clearTimeout(searchTypeTimeout)

            }
            if (e.keyCode === 13) {
                e.preventDefault();
                searchArea()

            } else {
                if ($("#" + idname + "-search").val() === "") {
                    searchArea()

                } else {
                    $("#clear-search").css("visibility", "visible")

                }

            }
            searchTypeTimeout = window.setTimeout(searchArea, 800)

        });
        $("#clear-search").click(function() {
            $("#" + that.idname + "-search").val("");
            searchArea()

        });
        var inter = "";
        if (dotviewmap.env.hasCompositing) {
            inter = ' readonly="readonly"';
            inter = '<p><label class="' + idname + '-intersection" for="' + idname + '-intersection">Intersect: </label><input' + inter + ' class="' + idname + '-intersection" type="checkbox" id="' + idname + '-intersection"/></p>'

        } else {
            inter = "<p>The intersection feature currently only works in Firefox or Opera.</p>"

        }
        var add = "";
        if (that.getOption("dayTimeEnabled")) {
            add = '<div class="daytime"><h4>Experimental: Set Time Of Day and Weekday</h4><div style="float:right; margin:0 10px"><input type="radio" class="' + idname + '-daytime-day" name="' + idname + '-daytime-day" id="' + idname + '-daytime-day-mon" value="mon" checked="checked"/><label for="' + idname + '-daytime-day-mon">Mon-Fri</label><input type="radio" class="' + idname + '-daytime-day" name="' + idname + '-daytime-day" id="' + idname + '-daytime-day-sat" value="sat"/><label for="' + idname + '-daytime-day-sat">Saturday</label><input type="radio" class="' + idname + '-daytime-day" name="' + idname + '-daytime-day" id="' + idname + '-daytime-day-sun" value="sun"/><label for="' + idname + '-daytime-day-sun">Sunday</label></div><div><div id="' + idname + '-daytimeslider"></div><div style="width:50%;text-align:justify;font-size:6pt">12AM 3AM 6AM 9AM 12PM 3PM 6PM 9PM 12AM</div></div></div>'

        }
        container.after('<div class="contentoverlay" style="display:none" id="configure"><a class="close toggle" href="#configure">close</a><h2>dotviewmap Settings</h2><p><label for="' + idname + '-gobybike">Do you have a bike with you? </label><input type="checkbox" class="' + idname + '-goby" id="' + idname + '-gobybike" name="' + idname + '-goby" value="bike"/></p><p><label for="' + idname + '-gotime">Max. time to walk/ride from/to stations: </label><input size="4" type="text" id="' + idname + '-gotime" value="' + Math.floor(that.getOption("maxWalkTime") / 60) + '"/> minutes</p><p><label for="' + idname + '-color">Show color map</label>: <input type="checkbox" id="' + idname + '-color"/></p>' + inter + add + "</div>");
        $("." + idname + "-goby").change(updateGoby);
        $("#" + idname + "-gotime").change(updateGoby);
        if (that.getOption("dayTimeEnabled")) {
            $("#" + idname + "-daytimeslider").slider({
                value: 100,
                min: 0,
                max: 499,
                animate: true,
                stop: dayTimeChanged

            });
            $("." + idname + "-daytime-day").change(dayTimeChanged)

        }
        $("#" + idname + "-markerrepo").mousedown(function(e) {
            e.preventDefault()

        });
        var newMarkerOffset = $("#" + idname + "-markerrepo-marker").offset();
        var newMarkerOptions = {
            stop: function(e) {
                var offset = $(this).offset();
                var mapOffset = $(dotviewmap.map.getDiv()).offset();
                var x = offset.left + 10 - mapOffset.left;
                var y = offset.top + 34 - mapOffset.top;
                $(this).draggable("destroy");
                $(this).offset(newMarkerOffset);
                $(this).draggable(newMarkerOptions);
                if (y < 0) {
                    return

                }
                var latlng = dotviewmap.getLatLngFromWindowXY(x, y);
                addPosition(latlng)

            },
            scroll: false

        };
        $("#" + idname + "-markerrepo-marker").draggable(newMarkerOptions);
        if (!dotviewmap.env.hasCompositing) {
            $("." + idname + "-intersection").click(function(e) {
                showMessage("Your browser does not support intersections, try Firefox or Opera!");
                return

            })

        } else {
            $("#" + idname + "-intersection").change(function(e) {
                intersection = $(this).is(":checked");
                setIntersection(intersection);
                updateOptionsHash();
                dotviewmap.trigger("redraw")

            })

        }
        $("#" + idname + "-color").change(function(e) {
            color = $(this).is(":checked");
            setColor(color);
            updateOptionsHash();
            dotviewmap.trigger("redraw")

        })

    };
    var openPositionWindow = function(index) {
        return function() {
            startPositions[index].infowindow.open(dotviewmap.map, startPositions[index].marker)

        }

    };
    var addPositionHtml = function(index) {
        if (startPositionsCount === 1) {
            $("#" + idname + "-positionContainer").html("")

        }
        $("#" + idname + "-positionContainer").prepend('<div id="' + idname + "-" + index + '" class="position-container"><span style="visibility:hidden" id="' + idname + "-" + index + '-info">At most <strong id="' + idname + "-" + index + '-timeSpan"></strong> minutes to any point in the highlighted area (estimate)</span><div><input type="button" value="X" id="' + idname + "-" + index + '-remove" class="remove-button"/><div style="display:none" id="' + idname + "-" + index + '-slider"></div><div style="display:none" id="' + idname + "-" + index + '-progressbar"></div></div><div style="font-size:9px;" class="' + idname + "-" + index + '-address"></div></div>');
        $("#" + idname + "-" + index).mouseover(highlightMarker(index));
        $("#" + idname + "-" + index).mouseout(unhighlightMarker(index));
        $("#" + idname + "-" + index + "-slider").slider({
            min: 0,
            max: that.getOption("maxWalkTravelTime"),
            slide: updateSlider(index),
            stop: updateSlider(index),
            value: Math.round(startPositions[index].time / 60),
            animate: true

        });
        $("#" + idname + "-" + index + "-progressbar").progressbar({
            value: 0

        });
        $("#" + idname + "-" + index + "-timeSpan").text(Math.round(startPositions[index].time / 60));
        $("#" + idname + "-" + index + "-remove").click(function() {
            removePosition(index)

        })

    };
    var highlightPositionArea = function(index) {
        $("#controls").css("opacity", "1");
        if (index !== undefined) {
            $("#" + idname + "-" + index).css("outline", "1px rgb(0,187,11) solid")

        }

    };
    var animatePositionBackground = function(index, white) {
        $("#" + idname + "-" + index).animate({
            backgroundColor: white ? "#fff": "#dadada"

        },
        2000, 
        function() {
            if (startPositions[index].calculating) {
                animatePositionBackground(index, !white)

            } else {
                $("#" + idname + "-" + index).css({
                    backgroundColor: "#fff"

                })

            }

        })

    };
    var unhighlightPositionArea = function(index) {
        if (that.getCalculationsInProgress() === 0) {
            $("#controls").css("opacity", "")

        }
        if (index !== undefined) {
            $("#" + idname + "-" + index).css({
                backgroundColor: "#fff",
                outline: "inherit"

            })

        }

    };
    var highlightMarker = function(index) {
        return function() {
            highlightPositionArea(index);
            startPositions[index].marker.setIcon(highlightedIconUrl)

        }

    };
    var unhighlightMarker = function(index) {
        return function() {
            unhighlightPositionArea(index);
            startPositions[index].marker.setIcon(normalIconUrl)

        }

    };
    var setAddressForPosition = function(position) {
        return function(adr) {
            startPositions[position.index].address = adr;
            $("." + idname + "-" + position.index + "-address").text(adr)

        }

    };
    var displayPendingLoad = function(doit) {
        highlightPositionArea();
        if (doit) {
            $("#" + idname + "-loading").css("background", "url(/media/img/loading.gif) center center no-repeat").progressbar("destroy").show()

        } else {
            $("#" + idname + "-loading").show().css("background", "").progressbar({
                value: 0

            })

        }

    };
    var updatePositionHash = function(index) {
        var params = {};
        params["lat" + index] = startPositions[index].latlng.lat;
        params["lng" + index] = startPositions[index].latlng.lng;
        params["t" + index] = Math.round(startPositions[index].time / 60);
        $.address.parameterMap(params);
        if (currentSearch) {
            currentSearch = undefined;
            searchArea()

        }

    };
    var showMessage = function(message, keepDisplayed) {
        $("#message").html(message);
        $("#message").fadeIn(200);
        if (!keepDisplayed) {
            window.setTimeout(function() {
                if ($("#message").css("display") !== "none") {
                    $("#message").fadeOut(400)

                }

            },
            8500)

        }

    };
    var hideMessage = function() {
        $("#message").fadeOut(200)

    };
    var hashChange = function(event) {
        var params = event.parameters,
        index,
        completeRecalc = false;
        var recalc = {},
        remove = {};
        updateMapPositionAndZoom(true, params.lat, params.lng, params.zoom);
        for (index in startPositions) {
            recalc[index] = {
                moved: false

            };
            if (params["lat" + index] !== undefined) {
                recalc[index].lat = parseFloat(params["lat" + index]);
                if (parseFloat(params["lat" + index]) !== startPositions[index].latlng.lat) {
                    recalc[index].moved = true

                }

            } else {
                if (params["lat" + index] === undefined) {
                    remove[index] = true

                }

            }
            if (params["lng" + index] !== undefined) {
                recalc[index].lng = parseFloat(params["lng" + index]);
                if (parseFloat(params["lng" + index]) !== startPositions[index].latlng.lng) {
                    recalc[index].moved = true

                }

            } else {
                if (params["lng" + index] === undefined) {
                    remove[index] = true

                }

            }
            if (params["t" + index] !== undefined && parseInt(params["t" + index], 10) !== startPositions[index].time) {
                setSecondsForIndex(parseInt(params["t" + index], 10) * 60, index)

            }

        }
        for (index in recalc) {
            if (remove[index] === undefined && recalc[index].moved) {
                setPosition(recalc[index], index)

            }

        }
        for (index in remove) {
            removePosition(index)

        }
        var newPositions = {},
        searchFor = ["lat", "lng", "t"];
        for (var key in params) {
            for (var i = 0; i < searchFor.length; i++) {
                if (key.indexOf(searchFor[i]) === 0) {
                    index = parseInt(key.substring(searchFor[i].length, key.length), 10);
                    if (!isNaN(index) && startPositions[index] === undefined) {
                        newPositions[index] = newPositions[index] || {};
                        newPositions[index][searchFor[i]] = parseFloat(params[key])

                    }
                    break

                }

            }

        }
        for (index in newPositions) {
            addPosition({
                lat: newPositions[index].lat,
                lng: newPositions[index].lng

            },
            newPositions[index].t * 60)

        }
        var opts = {};
        if (params.maxWalkTime !== undefined) {
            opts.maxWalkTime = params.maxWalkTime * 60

        } else {
            opts.maxWalkTime = that.getDefaultOption("maxWalkTime")

        }
        opts.bike = !!params.bike;
        opts.intersection = params.intersection == "true" ? true: false;
        opts.color = params.color == "true" ? true: false;
        completeRecalc = completeRecalc || setOptions(opts);
        if (that.getOption("dayTimeEnabled")) {
            var dt = params.dayTime || that.getDefaultOption("intervalKey");
            completeRecalc = completeRecalc || setDayTime(dt)

        }
        if (params.search !== currentSearch) {
            setSearch(params.search)

        }
        if (completeRecalc) {
            that.calculateAll()

        } else {
            dotviewmap.trigger("redraw")

        }

    };
    var resultMarker = {},
    outsideAreaIcon = "/media/img/greymarker.png",
    insideAreaIcon = "http://gmaps-samples.googlecode.com/svn/trunk/markers/red/blank.png",
    currentSearch = undefined,
    lastSearchSqkm = 0,
    searchTypeTimeout = false;
    var showSearchIndicator = function() {
        $("#urbanDistance-search-indicator").css("visibility", "visible")

    };
    var hideSearchIndicator = function() {
        $("#urbanDistance-search-indicator").css("visibility", "hidden")

    };
    var clearSearch = function() {
        for (var id in resultMarker) {
            removeMarker(resultMarker[id].marker);
            resultMarker[id].marker = null;
            resultMarker[id].infowindow.close();
            resultMarker[id].infowindow = null

        }
        resultMarker = {}

    };
    var closeAllSearchResultWindows = function() {
        for (var id in resultMarker) {
            resultMarker[id].infowindow.close()

        }

    };
    var searchArea = function() {
        if (that.getCalculationsInProgress() > 0) {
            return

        }
        var query = $("#" + that.idname + "-search").val();
        if (query === "") {
            $("#clear-search").css("visibility", "hidden");
            currentSearch = null;
            $("#search-attribution").hide();
            $.address.deleteParameters(["search"]);
            clearSearch();
            dotviewmap.unbind("idleAfterRedrawing", updateSearch);
            return

        }
        if (currentSearch === query) {
            return

        } else {
            clearSearch()

        }
        if (startPositionsCount === 0) {
            showMessage("You need at least one starting point!");
            return

        }
        showSearchIndicator();
        currentSearch = query;
        $.address.parameter("search", currentSearch);
        var blobs = that.search.detectBlobs();
        lastSearchSqkm = that.getCoveredArea();
        var totalPoints = 0;
        var blobsearchers = [];
        for (var i = 0; i < blobs.length; i++) {
            totalPoints += blobs[i].points.length;
            var sqkm = that.numberOfPixelsToSqkm(blobs[i].points.length);
            blobs[i].sqkm = sqkm;
            if (sqkm <= 0.02 && blobs.length <= 2) {
                continue

            } (function() {
                var bsearcher = new google.search.LocalSearch();
                var blobGeoPoint = dotviewmap.getLatLngFromCanvasXY(blobs[i].midx, blobs[i].midy);
                bsearcher.setCenterPoint(new google.maps.LatLng(blobGeoPoint.lat, blobGeoPoint.lng));
                bsearcher.setAddressLookupMode(google.search.LocalSearch.ADDRESS_LOOKUP_ENABLED);
                bsearcher.setResultSetSize(google.search.Search.LARGE_RESULTSET);
                bsearcher.setSearchCompleteCallback(bsearcher, 
                function() {
                    searchComplete.call(this, blobs[i])

                });
                bsearcher.execute(query)

            } ())

        }

    };
    var setSearch = function(query) {
        if (query != null && query != "") {
            $("#" + that.idname + "-search").val(query);
            $("#clear-search").css("visibility", "visible")

        } else {
            $("#" + that.idname + "-search").val("");
            $("#clear-search").css("visibility", "hidden")

        }

    };
    var searchComplete = function(blob) {
        var i;
        hideSearchIndicator();
        if (!this.cursor) {
            showMessage("Your search returned no results.");
            return

        }
        if (this.cursor.currentPageIndex === 0) {
            var attribution = this.getAttribution();
            var attrDiv = $("#search-attribution");
            if (attribution) {
                attrDiv.html(attribution);
                attrDiv.show();
                attrDiv.parent().show()

            }

        }
        addSearchResults(this);
        if (this.cursor && this.cursor.currentPageIndex === 0) {
            if (this.cursor.pages[this.cursor.currentPageIndex + 1] !== undefined) {
                showSearchIndicator();
                this.gotoPage(this.cursor.currentPageIndex + 1)

            }

        }
        dotviewmap.bind("idleAfterRedrawing", updateSearch)

    };
    var updateSearch = function() {
        updateSearchResults()

    };
    var updateSearchResults = function() {
        for (var id in resultMarker) {
            var xy = dotviewmap.getCanvasXY(resultMarker[id].pos);
            if (that.isHighlighted(xy.x, xy.y)) {
                resultMarker[id].marker.setIcon(insideAreaIcon);
                resultMarker[id].active = true

            } else {
                resultMarker[id].marker.setIcon(outsideAreaIcon);
                resultMarker[id].active = false

            }

        }

    };
    var addSearchResults = function(searcher) {
        for (i = 0; i < searcher.results.length; i++) {
            var result = searcher.results[i];
            var markerId = "m" + result.lat + "_" + result.lng;
            if (resultMarker[markerId] !== undefined) {
                continue

            } (function() {
                var xy = dotviewmap.getCanvasXY({
                    lat: result.lat,
                    lng: result.lng

                });
                var marker = createMarker({
                    lat: result.lat,
                    lng: result.lng

                });
                if (that.isHighlighted(xy.x, xy.y)) {
                    marker.setIcon(insideAreaIcon)

                } else {
                    marker.setIcon(outsideAreaIcon)

                }
                var infowindow = new google.maps.InfoWindow({
                    content: result.html.cloneNode(true)

                });
                resultMarker[markerId] = {
                    marker: marker,
                    infowindow: infowindow,
                    pos: {
                        lat: result.lat,
                        lng: result.lng

                    }

                };
                addEventOnMarker("click", marker, 
                function() {
                    closeAllSearchResultWindows();
                    infowindow.open(dotviewmap.map, marker)

                })

            } ())

        }

    }

};
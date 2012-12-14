((function() {
    $(function() {
        return $("body").delegate("a.close", "click", 
        function() {
            return $(this).closest("section").slideUp()
        }),
        $("a.submitForm").click(function() {
            return $(this).closest("form").submit(),
            !1
        })
    })
})).call(this),
function() {
    this.Guiderer = {
        Models: {},
        Collections: {},
        Routers: {},
        Views: {}
    }
}.call(this),
function() {
    this.JST || (this.JST = {}),
    this.JST["backbone/templates/guide"] = function(obj) {
        var __p = [],
        print = function() {
            __p.push.apply(__p, arguments)
        };
        with(obj || {}) __p.push("<h3>", model.escape("name"), '</h3>\n<input id="guide_pois_attributes_', model.get("index"), '_name" name="guide[pois_attributes][', model.get("index"), '][name]" type="hidden" value="', model.escape("name"), '">\n');
        return __p.join("")
    }
}.call(this),
function() {
    var a = Object.prototype.hasOwnProperty,
    b = function(b, c) {
        function e() {
            this.constructor = b
        }
        for (var d in c) a.call(c, d) && (b[d] = c[d]);
        return e.prototype = c.prototype,
        b.prototype = new e,
        b.__super__ = c.prototype,
        b
    };
    Guiderer.Models.Guide = function(a) {
        function c() {
            c.__super__.constructor.apply(this, arguments)
        }
        return b(c, a),
        c.prototype.paramRoot = "guide",
        c.prototype.defaults = {
            name: "",
            index: 0
        },
        c
    } (Backbone.Model),
    Guiderer.Collections.GuidesCollection = function(a) {
        function c() {
            c.__super__.constructor.apply(this, arguments)
        }
        return b(c, a),
        c.prototype.model = Guiderer.Models.Guide,
        c
    } (Backbone.Collection)
}.call(this),
function() {
    var a = Object.prototype.hasOwnProperty,
    b = function(b, c) {
        function e() {
            this.constructor = b
        }
        for (var d in c) a.call(c, d) && (b[d] = c[d]);
        return e.prototype = c.prototype,
        b.prototype = new e,
        b.__super__ = c.prototype,
        b
    };
    Guiderer.Views.Carousel = function(a) {
        function c() {
            c.__super__.constructor.apply(this, arguments)
        }
        return b(c, a),
        c.prototype.events = {
            "click .prev": "previous",
            "click .next": "next",
            "click img.thumb": "select"
        },
        c.prototype.initialize = function(a) {
            return this.container = this.$(".imagesContainer"),
            this.searcher = new google.search.ImageSearch,
            this.searcher.setSearchCompleteCallback(this, this.processImageSearchResults, [this.searcher]),
            this.searcher.setRestriction(google.search.ImageSearch.RESTRICT_IMAGESIZE, google.search.ImageSearch.IMAGESIZE_LARGE),
            this.searcher.setRestriction(google.search.ImageSearch.RESTRICT_IMAGESIZE, google.search.ImageSearch.IMAGESIZE_MEDIUM),
            this.searcher.setRestriction(google.search.Search.RESTRICT_SAFESEARCH, google.search.Search.SAFESEARCH_STRICT),
            this.searcher.setRestriction(google.search.ImageSearch.RESTRICT_IMAGETYPE, google.search.ImageSearch.IMAGETYPE_PHOTO),
            this.searcher.setNoHtmlGeneration(),
            this.searcher.setResultSetSize(8),
            this.reset(a.title)
        },
        c.prototype.reset = function(a) {
            var b,
            c;
            return c = a.split(",")[0],
            b = a.split(",")[1].split("/"),
            this.searcher.execute(c + "," + b[0]),
            this.page = 0,
            this.lastPage = 0,
            this.loading = !1,
            this.next = this.$(".next"),
            this.prev = this.$(".prev"),
            this.container.html(""),
            this.prev.hide()
        },
        c.prototype.processImageSearchResults = function(a) {
            var b,
            c,
            d,
            e;
            e = a.results;
            for (c = 0, d = e.length; c < d; c++) b = e[c],
            this.container.append($("<img src='" + b.tbUrl + "' width=150 height=150 class='thumb' data-url='" + b.url + "' data-tburl='" + b.tbUrl + "'/>"));
            return this.loading = !1
        },
        c.prototype.previous = function(a) {
            a.preventDefault();
            if (this.loading || this.page === 0) return;
            return this.page--,
            this.page >= 0 && (this.next.show(), this.container.animate({
                left: "+=680"
            }), this.page === 0 && this.prev.hide()),
            !1
        },
        c.prototype.next = function(a) {
            a.preventDefault();
            if (this.loading || this.page >= 15) return;
            return this.page++,
            this.page > this.lastPage && this.page % 2 === 0 && (this.loading = !0, this.searcher.gotoPage(this.page / 2), this.lastPage = this.page),
            this.page === 15 && this.next.hide(),
            this.prev.show(),
            this.container.animate({
                left: "-=680"
            }),
            !1
        },
        c.prototype.select = function(a) {
            return this.options.poiView.setGoogleImageUrl($(a.target).attr("data-url"), $(a.target).attr("data-tburl")),
            this.$(".close-reveal-modal").click(),
            !1
        },
        c
    } (Backbone.View)
}.call(this),
function() {
    var a = Object.prototype.hasOwnProperty,
    b = function(b, c) {
        function e() {
            this.constructor = b
        }
        for (var d in c) a.call(c, d) && (b[d] = c[d]);
        return e.prototype = c.prototype,
        b.prototype = new e,
        b.__super__ = c.prototype,
        b
    };
    Guiderer.Views.Guide = function(a) {
        function c() {
            c.__super__.constructor.apply(this, arguments)
        }
        return b(c, a),
        c.prototype.tagName = "div",
        c.prototype.className = "guideItemPOI",
        c.prototype.initialize = function() {},
        c.prototype.render = function() {
            return $(this.el).html(JST["backbone/templates/guide"]({
                model: this.model
            })),
            this
        },
        c
    } (Backbone.View)
}.call(this),
function() {
    var a = Object.prototype.hasOwnProperty,
    b = function(b, c) {
        function e() {
            this.constructor = b
        }
        for (var d in c) a.call(c, d) && (b[d] = c[d]);
        return e.prototype = c.prototype,
        b.prototype = new e,
        b.__super__ = c.prototype,
        b
    };
    Guiderer.Views.Guides = function(a) {
        function c() {
            c.__super__.constructor.apply(this, arguments)
        }
        return b(c, a),
        c.prototype.el = $(document.body),
        c.prototype.events = {
            "click #add_button": "add",
            "keypress #poi_name": "checkEnterKey",
            "click #next": "disableSubmit"
        },
        c.prototype.initialize = function() {
            var a = this;
            return this.poiName = $("#poi_name"),
            this.guides = new Guiderer.Collections.GuidesCollection,
            $(".guideItemPOI h3").each(function(b) {
                return a.guides.add({
                    name: $(a).html(),
                    index: b
                })
            }),
            this.updateCountDown()
        },
        c.prototype.updateCountDown = function() {
            var a;
            return a = 3 - this.guides.length,
            a <= 0 ? ($("#guide_countdown_msg").css({
                visibility: "hidden"
            }), $("#next").removeClass("inactive")) : a === 1 ? $("#guide_countdown").html("" + a + " Point") : $("#guide_countdown").html("" + a + " Points")
        },
        c.prototype.add = function() {
            var a,
            b;
            return a = $.trim(this.poiName.val()),
            a.length > 0 && (this.guides.add({
                name: a,
                index: this.guides.length
            }), b = new Guiderer.Views.Guide({
                model: this.guides.last()
            }), $("#getStartedCreatePOIList").append(b.render().el)),
            this.updateCountDown(),
            this.poiName.val(""),
            this.poiName.focus(),
            !1
        },
        c.prototype.checkEnterKey = function(a) {
            return a.keyCode === 13 ? (this.add(), !1) : a.charCode === 44 ? (this.add(), !1) : !0
        },
        c.prototype.disableSubmit = function(a) {
            var b;
            return b = $(a.target),
            $("<span>Saving...</span>").insertAfter(b),
            b.hide()
        },
        c
    } (Backbone.View)
}.call(this),
function() {
   var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

Guiderer.Views.Location = (function(_super) {

  __extends(Location, _super);

  Location.name = 'Location';

  function Location() {
    return Location.__super__.constructor.apply(this, arguments);
  }

  Location.prototype.el = $(document.body);

  Location.flip = 0;

  Location.prototype.events = {
    "click #change_location": "change_location"
  };

  Location.prototype.initialize = function() {
    var options;
    this.searchField = $('#searchTextField');
    this.searchField.keypress(function(e) {
      return e.keyCode !== 13;
    });
    options = {
      mapkey: "ABQIAAAAbnvDoAoYOSW2iqoXiGTpYBTIx7cuHpcaq3fYV4NM0BaZl8OxDxS9pQpgJkMv0RxjVl6cDGhDNERjaQ",
      selectFirst: false,
      minChars: 1,
      cacheLength: 50,
      width: $('#poi_name').width(),
      scroll: true,
      scrollHeight: 330
    };
    return $('#poi_name').geo_autocomplete(new google.maps.Geocoder, options);
  };

  Location.prototype.change_location = function() {
    var _this = this;
    $('#map_panel').toggle('fast', function() {
      return _this.initMap();
    });
    if ($('#change_location')[0].innerText === "change") {
      $('#change_location')[0].innerText = "click to hide map";
    } else {
      $('#change_location')[0].innerText = "change";
    }
    return false;
  };

  Location.prototype.initMap = function() {
    var hasLocation, lat, lng, mapOptions, zoom,
      _this = this;
    hasLocation = $('#guide_lat').val() !== "";
    lat = hasLocation ? $('#guide_lat').val() : 19.147006;
    lng = hasLocation ? $('#guide_lng').val() : -36.514875;
    zoom = hasLocation ? 17 : 2;
    mapOptions = {
      center: new google.maps.LatLng(lat, lng),
      zoom: zoom,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    this.map = new google.maps.Map($('#map_location')[0], mapOptions);
    this.autocomplete = new google.maps.places.Autocomplete(this.searchField[0]);
    this.marker = new google.maps.Marker({
      map: this.map,
      position: mapOptions.center
    });
    this.autocomplete.bindTo('bounds', this.map);
    return google.maps.event.addListener(this.autocomplete, 'place_changed', function() {
      return _this.placeChanged();
    });
  };

  Location.prototype.MapSearch = function(address, callback) {
    var options;
    if (address !== "") {
      this.geocoder = new google.maps.Geocoder();
      options = {
        address: address
      };
      return this.geocoder.geocode(options, callback);
    }
  };

  Location.prototype.searchCallback = function(results, status) {
    var options;
    if (status === google.maps.GeocoderStatus.OK) {
      options = {
        bounds: results[0].geometry.viewport,
        types: ['establishment']
      };
      return this.autocomplete_guide = new google.maps.places.Autocomplete($('#poi_name')[0], options);
    }
  };

  Location.prototype.placeChanged = function() {
    var image, place;
    place = this.autocomplete.getPlace();
    if (place.geometry.viewport) {
      this.map.fitBounds(place.geometry.viewport);
    } else {
      this.map.setCenter(place.geometry.location);
      this.map.setZoom(17);
    }
    image = new google.maps.MarkerImage(place.icon, new google.maps.Size(71, 71), new google.maps.Point(0, 0), new google.maps.Point(17, 34), new google.maps.Size(35, 35));
    this.marker.setIcon(image);
    this.marker.setPosition(place.geometry.location);
    $('#location_name').html(this.searchField.val());
    $('#guide_location').val(place.formatted_address);
    $('#guide_lat').val(place.geometry.location.lat());
    $('#guide_lng').val(place.geometry.location.lng());
    return $(document.body).trigger('location:changed');
  };

  return Location;

})(Backbone.View);
}.call(this),
function() {
    var a,
    b;
    google.load("search", "1"),
    a = function() {
        var c= new Guiderer.Views.Guides;
        var d= new Guiderer.Views.Location;
		 
		/*$("section.guideItemPOI").each(function() {
            return new Guiderer.Views.Poi({
                el: this
            })
        })*/
		return c,d;
    },
    b = function() {
        return typeof google.search == "undefined" ? (console.log("wait for search lib"), setTimeout(b, 1500)) : setTimeout(a, 1e3)
    },
    setTimeout(b, 1e3)
}.call(this);
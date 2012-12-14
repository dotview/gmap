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
    Guiderer.Views.Location = function(a) {
        function c() {
            c.__super__.constructor.apply(this, arguments)
        }
        return b(c, a),
        c.prototype.el = $(document.body),
        c.flip = 0,
        c.prototype.events = {
            "click #change_location": "change_location"
        },
        c.prototype.initialize = function() {
            return this.searchField = $("#searchTextField"),
            this.searchField.keypress(function(a) {
                return a.keyCode !== 13
            }),
            this
        },
        c.prototype.change_location = function() {
            var a = this;
            return $("#map_panel").toggle("fast", 
            function() {
                return a.initMap()
            }),
            $("#change_location")[0].innerText === "change" ? $("#change_location")[0].innerText = "click to hide map": $("#change_location")[0].innerText = "change",
            !1
        },
        c.prototype.initMap = function() {
            var a,
            b,
            c,
            d,
            e,
            f = this;
            return a = $("#guide_lat").val() !== "",
            b = a ? $("#guide_lat").val() : 19.147006,
            c = a ? $("#guide_lng").val() : -36.514875,
            e = a ? 17: 2,
            d = {
                center: new google.maps.LatLng(b, c),
                zoom: e,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            },
            this.map = new google.maps.Map($("#map_location")[0], d),
            this.autocomplete = new google.maps.places.Autocomplete(this.searchField[0]),
            this.marker = new google.maps.Marker({
                map: this.map,
                position: d.center
            }),
            this.autocomplete.bindTo("bounds", this.map),
            google.maps.event.addListener(this.autocomplete, "place_changed", 
            function() {
                return f.placeChanged()
            })
        },
        c.prototype.placeChanged = function() {
            var a,
            b;
            return b = this.autocomplete.getPlace(),
            b.geometry.viewport ? this.map.fitBounds(b.geometry.viewport) : (this.map.setCenter(b.geometry.location), this.map.setZoom(17)),
            a = new google.maps.MarkerImage(b.icon, new google.maps.Size(71, 71), new google.maps.Point(0, 0), new google.maps.Point(17, 34), new google.maps.Size(35, 35)),
            this.marker.setIcon(a),
            this.marker.setPosition(b.geometry.location),
            $("#location_name").html(this.searchField.val()),
            $("#guide_location").val(b.formatted_address),
            $("#guide_lat").val(b.geometry.location.lat()),
            $("#guide_lng").val(b.geometry.location.lng()),
            $(document.body).trigger("location:changed")
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
    Guiderer.Views.Poi = function(a) {
        function c() {
            c.__super__.constructor.apply(this, arguments)
        }
        return b(c, a),
        c.prototype.events = {
            "click .edit_description": "editDescription",
            "click .description": "editDescription",
            "click .edit_image": "editImage",
            "keypress h3 input": "reset"
        },
        c.prototype.initialize = function() {
            var a = this;
            this.setTitle(),
            this.showMode = $(this.el).hasClass("show"),
            this.initMap();
            if (this.showMode) return;
            //return this.$(".image_placeholder").length > 0 && this.loadImageFromGoogle(),
			return this.$(".new_card").length > 0 && this.loadAddressFromGoogle(),
            this.carousel = new Guiderer.Views.Carousel({
                el: this.$(".reveal-modal"),
                title: this.title,
                poiView: this
            }),
            this.checkDescriptionPlaceholder(),
            $(document.body).bind("location:changed", 
            function() {
                return a.reset()
            })
        },
        c.prototype.editDescription = function() {
            var a,
            b;
            return a = $(this.el).find(".description"),
            b = $(this.el).find("textarea"),
            a.is(":visible") ? (a.html() !== a.attr("data-placeholder") && b.val(a.html().replace(/<br>/g, "\n")), b.width(a.width()), b.height(Math.max(a.height(), 140)), b.focus()) : $.trim(b.val()) === "" ? a.html(a.attr("data-placeholder")) : a.html(b.val().replace(/\n/g, "<br/>")),
            a.toggle(),
            b.toggle(),
            b.is(":visible") && b.focus(),
            !1
        },
        c.prototype.editImage = function() {
            var a;
            return a = $(this.el).find("input[type=file]"),
            a.toggle(),
            !1
        },
        c.prototype.loadImageFromGoogle = function() {
            var a,
            b,
            c;
            return this.$(".imageLoader").show(),
            c = new google.search.ImageSearch,
            c.setResultSetSize(8),
            c.setRestriction(google.search.ImageSearch.RESTRICT_IMAGESIZE, google.search.ImageSearch.IMAGESIZE_MEDIUM),
            c.setRestriction(google.search.Search.RESTRICT_SAFESEARCH, google.search.Search.SAFESEARCH_STRICT),
            c.setRestriction(google.search.ImageSearch.RESTRICT_IMAGETYPE, google.search.ImageSearch.IMAGETYPE_PHOTO),
            c.setSearchCompleteCallback(this, this.processImageSearchResults, [c]),
            c.setNoHtmlGeneration(),
            b = $("#location_name").val(),
            a = b.split("/"),
            c.execute(this.title + "," + a[0])
        },
        c.prototype.processImageSearchResults = function(a) {
            var b;
            this.$(".imageLoader").hide();
            if (a.results && a.results.length > 0) return b = a.results[0],
            this.setGoogleImageUrl(b.url, b.tbUrl)
        },
        c.prototype.setGoogleImageUrl = function(a, b) {
            return this.$(".extern_image_href").val(a),
            this.$(".mainthumb").attr("src", a)
        },
        c.prototype.loadAddressFromGoogle = function() {
            var a;
            return a = new google.search.LocalSearch,
            a.setCenterPoint($("#location_name").html()),
            a.setResultSetSize(1),
            a.setSearchCompleteCallback(this, this.processLocalSearchResults, [a]),
            a.setNoHtmlGeneration(),
            a.execute(this.title)
        },
        c.prototype.processLocalSearchResults = function(data) {
            var b,
            c;
            if (data.results && data.results.length > 0) 
			 { c = data.results[0];
            b = new google.maps.LatLng(c.lat, c.lng);
            this.map.setCenter(b);
            this.marker.setPosition(b);
            this.$(".vcard .org input").val(c.titleNoFormatting);
            this.$(".vcard .street-address input").val(c.streetAddress);
            this.$(".vcard .locality input").val(c.city);
            this.$(".vcard .region input").val(c.region);
            c.phoneNumbers && c.phoneNumbers.length > 0 && this.$(".vcard .tel input").val(c.phoneNumbers[0].number);
            this.$(".vcard .url").val(c.url);
            this.$(".vcard .lat").val(c.lat);
            this.$(".vcard .lng").val(c.lng);
			}
        },
        c.prototype.initMap = function() {
            var a,
            b,
            c,
            d,
            e = this;
            c = this.$(".map"),
            this.showMode ? (a = c.attr("data-lat"), b = c.attr("data-lng")) : (a = this.$("#poi_lat").val(), b = this.$("#poi_lng").val()),
            d = {
                center: new google.maps.LatLng(a, b),
                zoom: 15,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            },
            this.map = new google.maps.Map(this.$(".map")[0], d),
            this.marker = new google.maps.Marker({
                map: this.map,
                position: d.center
            });
            if (!this.showMode) return this.marker.setDraggable(!0),
            google.maps.event.addListener(this.marker, "dragend", 
            function() {
                var a;
                return a = e.marker.getPosition(),
                e.$(".vcard .lat").val(a.lat()),
                e.$(".vcard .lng").val(a.lng())
            })
        },
        c.prototype.checkDescriptionPlaceholder = function() {
            var a;
            a = this.$(".description");
            if ($.trim(a.html()) === "") return a.html(a.attr("data-placeholder"))
        },
        c.prototype.reset = function(a) {
            return a == null && (a = null),
            a === null || a.keyCode === 13 ? (this.setTitle(), this.loadImageFromGoogle(), this.loadAddressFromGoogle(), this.carousel.reset(this.title), !1) : !0
        },
        c.prototype.setTitle = function() {
            this.title = this.$("h3 input").val();
            if ($.trim($("#location_name").html()) !== "not found") return this.title += ", " + $("#location_name").html()
        },
        c
    } (Backbone.View)
}.call(this),
function() {
    var a,
    b;
    google.load("search", "1"),
    a = function() {
        return new Guiderer.Views.Guides,
        new Guiderer.Views.Location,
        $("section.guideItemPOI").each(function() {
            return new Guiderer.Views.Poi({
                el: this
            })
        })
    },
    b = function() {
        return typeof google.search == "undefined" ? (console.log("wait for search lib"), setTimeout(b, 1500)) : setTimeout(a, 1e3)
    },
    setTimeout(b, 1e3)
}.call(this);
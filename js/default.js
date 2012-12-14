jQuery.event.add(window, "load", resizeFrame);
jQuery.event.add(window, "resize", resizeFrame);
jQuery.event.add(window, "load", map_initialize);
jQuery.event.add(window, "error", function() { return true; });

$(document).ready(function() {
    $("#column_spit").toggle(
    function() {
        $("#column_spit img").attr("src", "images/switch_right.gif");
        $("#column_left").hide('slow');
        var w = jQuery(window).width();

    }, function() {
        $("#column_spit img").attr("src", "images/switch_left.gif");
        $("#column_left").show('slow');
    });

    $("#tab_top").bind("click", function() {
        $("#d_pic_latest").hide();
        $("#pic_top").fadeIn('slow');
        $("#left_tab div").removeClass("curtab");
        $("#tab_latest").addClass("commontab");
        $(this).addClass("curtab");
    });

    $("#tab_latest").bind("click", function() {
        $("#pic_top").hide();
        $("#d_pic_latest").fadeIn('slow');
        $("#left_tab div").removeClass("curtab");
        $("#tab_top").addClass("commontab");
        $(this).addClass("curtab");
    });

});

function MyControl(controlDiv, map) {
    controlDiv.style.padding = '4px';
    var controlUI = document.createElement('DIV');

    controlUI.style.cssText = ' border:1px solid #666;background:#f1f1f1;cursor:pointer;font-size:13px;';
    controlUI.innerHTML = " <b>結果:</b><span id=\"map_searchresult\" ></span>";
    controlDiv.appendChild(controlUI);
}
function CopyRightControl(controlDiv, map) {
    controlDiv.style.padding = '4px';
    var controlUI = document.createElement('DIV');
    controlUI.style.cssText = ' border:0px solid green;cursor:pointer;font-size:13px;color:#666;';
    controlUI.innerHTML = "copyright &copy GoSeeHome";
    controlDiv.appendChild(controlUI);
}
function SearchControl(controlDiv, map) {

    // Set CSS styles for the DIV containing the control
    // Setting padding to 5 px will offset the control
    // from the edge of the map
    controlDiv.style.padding = '5px';

    // Set CSS for the control border
    var controlUI = document.createElement('DIV');
    controlUI.style.cssText = 'color:red;border:0px solid green;cursor:pointer';
    //controlUI.innerHTML = "<input type='text' id='search' /><input type='button' value='search'/>";

    var TextCtl = document.createElement("input");
    TextCtl.type = "text";
    TextCtl.style.cssText = 'border:1px solid #346EA7;height:16px;width:120px;';
    TextCtl.id = "search";
    controlUI.appendChild(TextCtl);

    var ButtonCtl = document.createElement("input");
    ButtonCtl.type = "button";
    ButtonCtl.id = "btnSearch";
    ButtonCtl.style.cssText = 'border:1px solid #346EA7;cursor:pointer;height:20px;width:50px;';
    ButtonCtl.value = "search";

    controlUI.appendChild(ButtonCtl);

    controlDiv.appendChild(controlUI);

    google.maps.event.addDomListener(ButtonCtl, 'click', function(ev) {
        MapSearch(TextCtl.value);
    });
}

function resizeFrame() {
    var h = jQuery(window).height();
    var w = jQuery(window).width();
    jQuery("#map_property").css("height", (h < 1024 || w < 768) ? h - 102 : h - 380);
    jQuery("#tabpic").css("height", (h < 1024 || w < 768) ? h - 134 : h - 388);
    jQuery("#column_spit").css("margin-top", (h - 134) / 2);
}

function MapSearch(address, zoom) {
    if (address == "") {
        return;
    }
    var zoomval = zoom == null ? 12 : zoom;

    if (geocoder) {
        geocoder.geocode({ 'address': address }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                map.setCenter(results[0].geometry.location);
                if (makemarker == null) {
                    makemarker = new google.maps.Marker({
                        map: map,
                        position: results[0].geometry.location
                    });
                    map.setZoom(zoomval);
                }
                else {
                    makemarker.setPosition(results[0].geometry.location);
                    map.setZoom(zoomval);
                }
            } else {
                alert("找不到有關 " + address + " 的地方。");
            }
        });
    }
}

function showResult(txt) {
    if (document.getElementById("map_searchresult")) {
        document.getElementById("map_searchresult").innerHTML = txt;
    }
}
function showloading() {
    if (document.getElementById("map_searchresult")) {
        document.getElementById("map_searchresult").innerHTML = '<img src="/images/progressbar.gif" />';
    }
}
function ShowMapResult(totalCount) {
    var _map_searchresult;
    if (totalCount >= 60) {
        _map_searchresult = "找到了超过 60 个标记，放大地图能看到更多";
    }
    else if (totalCount == 0) {
        _map_searchresult = "没找到符合要求的标记，缩小地图试试";
    }
    else {
        _map_searchresult = "找到了 " + totalCount + " 个标记";
    }
    if (document.getElementById("map_searchresult")) {
        document.getElementById("map_searchresult").innerHTML = _map_searchresult;
    }
}
function SetFlashSrc(src) {
    return ' <object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=7,0,0,0"' +
                                  '  width="258px" height="168px" id="Untitled-1" align="middle">' +
                                  '  <param name="allowScriptAccess" value="sameDomain" />' +
                                  '  <param name="movie" value="' + src + '" />' +
                                  '  <param name="quality" value="high" />' +
                                  '  <param name="bgcolor" value="#ffffff" />' +
                                  '  <embed src="' + src + '" quality="high" bgcolor="#ffffff" width="258px"' +
                                  '  height="168px" name="mymovie" id="mymovie"  align="middle" allowscriptaccess="sameDomain" type="application/x-shockwave-flash"' +
                                  '  pluginspage="http://www.macromedia.com/go/getflashplayer" /> </object>';
}
var map;
var map_searchresult;
var geocoder;
var makemarker;
var quyuMarker = new Array();
var mdMarker = new Array();
var llPolys = new Array();

var g_poly = new Array();
var quyuobj = new Array();
var infowindow = new Array();
var polyMarker = new Array();

var quyuID;

function map_initialize() {
    var myLatlng = new google.maps.LatLng(30.308582906876072, 120.05160083789064);
    var myOptions = {
        zoom: 11,
        center: myLatlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    geocoder = new google.maps.Geocoder();
    map = new google.maps.Map(document.getElementById("map_property"), myOptions);


    var controlDiv = document.createElement('DIV');
    var mControl = new MyControl(controlDiv, map);
    controlDiv.index = 1;
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(controlDiv);

    var controlDiv2 = document.createElement('DIV');
    var copyControl = new CopyRightControl(controlDiv2, map);
    controlDiv2.index = 1;
    map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(controlDiv2);

    google.maps.event.addListener(map, 'idle', function() {
        setTimeout(function() { hse_filter_quyu() }, 0);
        setTimeout(function() { hse_filter_mendian() }, 10);
        setTimeout(function() { hse_filter_lianlu() }, 50);
    });

}

function hse_filter_quyu() {
    if (quyuMarker.length > 0) {
        return;
    }
    showloading();

    var sw = map.getBounds().getSouthWest();
    var ne = map.getBounds().getNorthEast();

    for (var j in quyuMarker) {
        quyuMarker[j].setMap(null);
    }

    var myLatLng_agent;
    var contentString;

    var img = 'images/quyu.gif';

    var img_cur = 'images/quyu_cur.gif';

    $.ajax({
        type: "GET",
        url: "data/quyu.txt",
        cache: true,
        data: {
            'type': 'list',
            pagesize: 60,
            pageindex: 1
        },

        success: function(data) {
            ShowMapResult(data.totalRecord);
            $.each(data.list, function(i) {
                var estate = data.list[i];
                var swBound = new google.maps.LatLng(estate.Lat, estate.Lng);
                var neBound = new google.maps.LatLng(22.333662, 114.148024);
                var bounds = new google.maps.LatLngBounds(swBound, neBound);

                quyuID = estate.ID;

                myLatLng_agent = new google.maps.LatLng(estate.Lat, estate.Lng);

                quyuMarker[i] = new google.maps.Marker({
                    position: myLatLng_agent,
                    map: map,
                    title: estate.Title,
                    zIndex: -10,
                    Icon: img
                });

                google.maps.event.addListener(quyuMarker[i], 'click', function() {
                    getQuYuInfo(estate.ID);
                });

                google.maps.event.addListener(quyuMarker[i], 'mouseover', function() {
                    quyuMarker[i].setZIndex(quyuMarker[i].getZIndex() + 200);
                    quyuMarker[i].setIcon(img_cur);
                    for (var j in llPolys) {
                        var path = llPolys[j].getPath();

                        for (m = 0; m < path.getLength(); m++) {
                            if (quyuMarker[i].position.equals(path.getAt(m))) {
                                llPolys[j].setOptions({ strokeColor: "red" });
                                g_poly.push(llPolys[j]);
                            }
                        }
                    }
                });
                google.maps.event.addListener(quyuMarker[i], 'mouseout', function() {
                    quyuMarker[i].setZIndex(quyuMarker[i].getZIndex() - 200);
                    quyuMarker[i].setIcon(img);
                    if (g_poly != null) {
                        for (var j in g_poly) {
                            g_poly[j].setOptions({ strokeColor: "#000000" });
                        }
                        for (var j in g_poly) {
                            g_poly.pop();
                        }
                    }
                });

            });
            if (quyuID != null) {
                getQuYuInfo(quyuID);
            }
        },
        error: function(d) {
            alert("fail to search!please try again!");
        },
        dataType: "json"
    });
}
function toggle_quyu(obj, quyubody) {
    $(obj).parent().siblings().toggle();
}
function getQuYuInfo(quyuID) {
    var contentString;
    $.ajax({
        type: "GET",
        url: "data/quyuinfo.txt",
        cache: true,
        data: {
            'type': 'info'
        },

        success: function(data) {


            var info = data.quyuinfo;
            $("#g_image").empty().append(' <img style="border: 0;" onerror="ImgError(this);" onload="imgReSize(this,240,160)"    src="' + info.ImgUrl + '" />');

            $("#g_flash").empty().append( SetFlashSrc(info.FlashUrl));
            
            var contentString = '<table cellspacing="0" class="tb_Block">' +
                                    '<thead><tr style="cursor:pointer;" onclick="toggle_quyu(this,\'quyubody\');"><td>区域基本信息</td><td class="flag"></td></tr></thead>' +
                                    '<tbody id="quyubody">' +
                                    '<tr><td class="td_RowHead">  ID:</td> <td class="td_LeftContent">   ' + info.ID + ' </td> </tr>' +
                                    '<tr><td class="td_RowHead">  名称:</td> <td class="td_LeftContent">    ' + info.Title + ' </td> </tr>' +
                                    '<tr><td class="td_RowHead">  负责人ID:</td> <td class="td_LeftContent">    ' + info.fzr + ' </td> </tr>' +
                                    '<tr><td class="td_RowHead">  建立日期:</td> <td class="td_LeftContent">    ' + info.jlrq + ' </td> </tr>' +
                                    '<tr><td class="td_RowHead">  统计归档日期:</td> <td class="td_LeftContent">    ' + info.gdrq + ' </td> </tr>' +
                                    '<tr><td class="td_RowHead">  维护负责人:</td> <td class="td_LeftContent">    ' + info.whfzr + ' </td> </tr>' +
                                    '<tr><td class="td_RowHead">  供货负责人:</td> <td class="td_LeftContent">    ' + info.ghfzr + ' </td> </tr>' +
                                    '<tr><td class="td_RowHead">  供应链路名称:</td> <td class="td_LeftContent">    ' + info.llmc + ' </td> </tr>' +
                                    '<tr><td class="td_RowHead">  最后维护日期:</td> <td class="td_LeftContent">    ' + info.whrq + ' </td> </tr>' +
                                    '</tbody></table> ';

            $("#info").empty().append(contentString);

            contentString = '<table cellspacing="0" id="medianlist" class="tb_Block">' +
                                     '<thead><tr style="cursor:pointer;" onclick="toggle_quyu(this);"><td>门店列表</td></tr></thead>' +
                                    '<tbody id="quyubody" ></tbody></table>  ';
            $("#list").empty().append(contentString);

            var list = data.mendianlist;
            $.each(list, function(i) {
                var row = list[i];
                contentString = '<tr><td><table cellspacing="0" class="tb_Block" style="width:100%!important;"> <tbody>' +
                                    '<tr><td class="td_RowHead">  ID:</td> <td class="td_LeftContent">   ' + row.ID + ' </td> </tr>' +
                                    '<tr><td class="td_RowHead">  名称:</td> <td class="td_LeftContent">    ' + row.Title + ' </td> </tr>' +
                                    '<tr><td class="td_RowHead">  地址:</td> <td class="td_LeftContent">    ' + row.address + ' </td> </tr>' +
                                    '</tbody></table> </td> </tr> ';

                $("#medianlist").append(contentString);
            });
        },
        error: function(d) {
            alert("fail to search!please try again!");
        },
        dataType: "json"
    });
}
function getMenDianInfo(quyuID) {

    var contentString;
    $.ajax({
        type: "GET",
        url: "data/mendianinfo" + quyuID + ".txt",
        cache: true,
        data: {
            'type': 'info'
        },

        success: function(data) {


            var info = data.mendianinfo;

            $("#g_image").empty().append(' <img style="border: 0;" onerror="ImgError(this);" onload="imgReSize(this,240,160)"    src="' + info.ImgUrl + '" />');
            $("#g_flash").empty().append(SetFlashSrc(info.FlashUrl));
         
            var contentString = '<table cellspacing="0" class="tb_Block">' +
                                    '<thead><tr style="cursor:pointer;" onclick="toggle_quyu(this,\'quyubody\');"><td>门店基本信息</td><td class="flag"></td></tr></thead>' +
                                    '<tbody id="quyubody">' +
                                    '<tr><td class="td_RowHead">  ID:</td> <td class="td_LeftContent">   ' + info.ID + ' </td> </tr>' +
                                    '<tr><td class="td_RowHead">  名称:</td> <td class="td_LeftContent">    ' + info.Title + ' </td> </tr>' +
                                    '<tr><td class="td_RowHead">  地址:</td> <td class="td_LeftContent">    ' + info.address + ' </td> </tr>' +
                                    '</tbody></table> ';

            $("#info").empty().append(contentString);

            contentString = '<table cellspacing="0" id="renyuanlist" class="tb_Block">' +
                                '<thead><tr style="cursor:pointer;" onclick="toggle_quyu(this);"><td>门店人员列表</td></tr></thead>' +
                                '<tbody id="quyubody" ></tbody></table>  ';
            $("#list").empty().append(contentString);

            var list = data.renyuanlist;
            $.each(list, function(i) {
                var row = list[i];
                contentString = '<tr><td><table cellspacing="0" class="tb_Block" style="width:100%!important;"> <tbody>' +
                                    '<tr><td class="td_RowHead">  ID:</td> <td class="td_LeftContent">   ' + row.ID + ' </td> </tr>' +
                                    '<tr><td class="td_RowHead">  人员编号:</td> <td class="td_LeftContent">    ' + row.rybh + ' </td> </tr>' +
                                    '<tr><td class="td_RowHead">  姓名:</td> <td class="td_LeftContent">    ' + row.xm + ' </td> </tr>' +
                                    '<tr><td class="td_RowHead">  企业编号:</td> <td class="td_LeftContent">    ' + row.qybh + ' </td> </tr>' +
                                    '<tr><td class="td_RowHead">  用工性质代码:</td> <td class="td_LeftContent">    ' + row.ygxzdm + ' </td> </tr>' +
                                    '<tr><td class="td_RowHead">  学历:</td> <td class="td_LeftContent">    ' + row.xl + ' </td> </tr>' +
                                    '<tr><td class="td_RowHead">  生日:</td> <td class="td_LeftContent">    ' + row.sr + ' </td> </tr>' +
                                    '<tr><td class="td_RowHead">  备注:</td> <td class="td_LeftContent">    ' + row.bz + ' </td> </tr>' +
                                    '</tbody></table> </td> </tr> ';

                $("#renyuanlist").append(contentString);
            });

        },
        error: function(d) {
            alert("fail to search!please try again!");
        },
        dataType: "json"
    });
}

function hse_filter_mendian() {
    if (mdMarker.length > 0) {
        return;
    }
    showloading();

    var sw = map.getBounds().getSouthWest();
    var ne = map.getBounds().getNorthEast();

    for (var j in mdMarker) {
        mdMarker[j].setMap(null);
    }

    var myLatLng_agent;
    var contentString;

    var img_cur = 'images/blue-dot.png';

    $.ajax({
        type: "GET",
        url: "data/mendian.txt",
        cache: true,
        data: {
            'type': 'list',
            pagesize: 60,
            pageindex: 1
        },

        success: function(data) {
            $.each(data.list, function(i) {
                estate = data.list[i];
                var swBound = new google.maps.LatLng(estate.Lat, estate.Lng);
                var neBound = new google.maps.LatLng(22.333662, 114.148024);
                var bounds = new google.maps.LatLngBounds(swBound, neBound);

                myLatLng_agent = new google.maps.LatLng(estate.Lat, estate.Lng);

                mdMarker[i] = new google.maps.Marker({
                    position: myLatLng_agent,
                    map: map,
                    title: estate.Title,
                    zIndex: -11,
                    Icon: img_cur
                });
                mdMarker[i].ID = estate.ID;

                google.maps.event.addListener(mdMarker[i], 'click', function() {
                    getMenDianInfo(mdMarker[i].ID);
                });


                google.maps.event.addListener(mdMarker[i], 'mouseover', function() {
                    mdMarker[i].setZIndex(mdMarker[i].getZIndex() + 200);
                    for (var j in llPolys) {
                        var path = llPolys[j].getPath();

                        for (m = 0; m < path.getLength(); m++) {
                            if (mdMarker[i].position.equals(path.getAt(m))) {
                                llPolys[j].setOptions({ strokeColor: "red" });
                                g_poly.push(llPolys[j]);
                            }
                        }

                    }
                });
                google.maps.event.addListener(mdMarker[i], 'mouseout', function() {
                    mdMarker[i].setZIndex(mdMarker[i].getZIndex() - 200);
                    if (g_poly != null) {
                        for (var j in g_poly) {
                            g_poly[j].setOptions({ strokeColor: "#333" });
                        }
                        for (var j in g_poly) {
                            g_poly.pop();
                        }
                    }
                });

            });
        },
        error: function(d) {
            alert("fail to search!please try again!");
        },
        dataType: "json"
    });

}


function hse_filter_lianlu() {
    if (llPolys.length > 0) {
        return;
    }
    for (var j in llPolys) {
        llPolys[j].setMap(null);
    }
    var polyOptions = {
        strokeColor: '#333',
        strokeOpacity: 0.8,
        strokeWeight: 2
    };

    $.ajax({
        type: "GET",
        url: "data/lianlu.txt",
        cache: true,
        data: {
            'type': 'list',
            pagesize: 60,
            pageindex: 1
        },

        success: function(data) {
            $.each(data.list, function(i) {
                var lianlu = data.list[i];
                var begin = new google.maps.LatLng(lianlu.beginLat, lianlu.beginLng);
                var end = new google.maps.LatLng(lianlu.endLat, lianlu.endLng);

                var  polyLatLng = new google.maps.LatLng((lianlu.beginLat+lianlu.endLat)/2, (lianlu.beginLng+lianlu.endLng)/2);

                polyMarker[i] = new google.maps.Marker({
                    position: polyLatLng,
                    map: map,
                    title: lianlu.Title,
                    zIndex: -10 ,
                    visible:false
                });
                
                llPolys[i] = new google.maps.Polyline(polyOptions);
                var path = llPolys[i].getPath();

                path.push(begin);
                path.push(end);
              
                 var    contentString = '<table cellspacing="0" class="tb_Block"> <tbody>' +
                                    '<tr><td class="td_RowHead">  ID:</td> <td class="td_LeftContent">   ' + lianlu.ID + ' </td> </tr>' +
                                    '<tr><td class="td_RowHead">  名称:</td> <td class="td_LeftContent">    ' + lianlu.Title + ' </td> </tr>' +
                                    '<tr><td class="td_RowHead">  属性:</td> <td class="td_LeftContent">    ' + lianlu.SX + ' </td> </tr>' +
                                    '<tr><td class="td_RowHead">  长度:</td> <td class="td_LeftContent">    ' + lianlu.CD + ' </td> </tr>' +
                                    '</tbody></table> ';
                 infowindow[i] = new google.maps.InfoWindow({
                    content: contentString
                 });
                
                 google.maps.event.addListener(llPolys[i], 'click', function() {
                     infowindow[i].open(map, polyMarker[i]);
                });


                google.maps.event.addListener(llPolys[i], 'mouseover', function() {
                      llPolys[i].setOptions({ strokeColor: "red" });
                        
                });
                google.maps.event.addListener(llPolys[i], 'mouseout', function() {
                         llPolys[i].setOptions({ strokeColor: "#333" });
                       
                });
                
                 llPolys[i].setMap(map);
            });
        },
        error: function(d) {
            alert("fail to search!please try again!");
        },
        dataType: "json"
    });

}
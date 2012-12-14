function launchRequest()
 {
    myText = new String();
    var url = RlUrl;
    var xml = $.ajax({
        url: url,
        async: false,
        dataType: 'xml'
    }).responseXML;
    var instruction = [];
    var dist = [];
    var time = [];
    var acc_dist = [];
    var acc_time = [];
    var wkt = [];
    $(xml).find("edge").each(function() {
        var id_text = $(this).attr('id');
        var val = $(this).find('instruction').text();
        instruction.push(val.toString());
        var val = $(this).find('dist').text();
        dist.push(parseFloat(val));
        var val = $(this).find('time').text();
        time.push(parseFloat(val));
        var val = $(this).find('acc_dist').text();
        acc_dist.push(parseFloat(val));
        var val = $(this).find('acc_time').text();
        acc_time.push(parseFloat(val));
        var val = $(this).find('wkt').text();
        wkt.push(val.toString());
    });
    var hold = [];
    for (var i = 0; i < wkt.length; i++)
    {
        var str = wkt[i];
        var a = str.indexOf("(");
        var z = str.indexOf(")");
        str = str.substring(a + 1, z);
        var points = [];
        var points = str.split(",");
        var leg = [];
        for (var j = 0; j < points.length; j++)
        {
            var LL = [];
            LL = points[j].split(" ");
            leg[j] = new LatLng(parseFloat(LL[1]), parseFloat(LL[0]));
        }
        hold.push(leg);
    }
    var steps = [];
    for (var i = 0; i < wkt.length; i++)
    {
        var newStep = new step(instruction[i], dist[i], time[i], acc_dist[i], acc_time[i], hold[i]);
        steps.push(newStep);
    }
    newRoute = new route(steps);
    RLroutes.push(newRoute);
    RlRequest = true;
}
function examineRLroutes()
 {
    document.write("Examine RLroutes[] <br>");
    document.write("RLroutes length is " + RLroutes.length + "<br>");
    document.write("steps length is " + RLroutes[RLroutes.length - 1].steps.length + "<br>");
    document.write("Steps are: <br>");
    for (i = 0; i < RLroutes[0].steps.length; i++)
    {
        document.write("Instruction " + RLroutes[0].steps[i].instruction + "  ");
        document.write("dist " + RLroutes[0].steps[i].dist + "  ");
        document.write("time " + RLroutes[0].steps[i].time + "  ");
        document.write("acc dist " + RLroutes[0].steps[i].acc_dist + "  ");
        document.write("acc time " + RLroutes[0].steps[i].acc_time + "  ");
        for (var j = 0; j < RLroutes[0].steps[i].leg.length; j++) document.write("leg " + j + "  " + RLroutes[0].steps[i].leg[j].lat + "," + RLroutes[0].steps[i].leg[j].lng + "  ");
        document.write("<p>");
    }
}
function getRlWaypoints(nPoints)
 {
    var polyline = [];
    var TotalLength;
    var CumDist = [];
    var nS = RLroutes[0].steps.length;
    for (var i = 0; i < nS; i++)
    {
        nL = RLroutes[0].steps[i].leg.length;
        for (var j = 0; j < nL; j++)
        {
            if (i != 0 && j == 0) continue;
            var LL = new google.maps.LatLng(RLroutes[0].steps[i].leg[j].lat, RLroutes[0].steps[i].leg[j].lng);
            polyline.push(LL);
        }
    }
    TotalLength = 0;
    CumDist.push(TotalLength);
    for (var i = 1; i < polyline.length; i++)
    {
        var dist = LatLngDist(polyline[i - 1].lat(), polyline[i - 1].lng(), polyline[i].lat(), polyline[i].lng());
        TotalLength += dist;
        CumDist.push(TotalLength);
    }
    var chunk = TotalLength / (nPoints + 0.99);
    rlPoints.length = 0;
    var point = 1;
    for (var i = 0; i < polyline.length; i++)
    {
        if (CumDist[i] >= point * chunk)
        {
            rlPoints.push(polyline[i]);
            point++;
        }
    }
    if (travelDirection == 0)
    var i = 0;
    else
    rlPoints.reverse();
}
function LatLng(lat, lng)
 {
    this.lat = lat;
    this.lng = lng;
}
function step(instruction, dist, time, acc_dist, acc_time, leg)
 {
    this.instruction = instruction;
    this.dist = dist;
    this.time = time;
    this.acc_dist = acc_dist;
    this.acc_time = acc_time;
    this.leg = leg;
}
function route(steps)
 {
    this.steps = steps;
}
function edgenode(nodes)
 {
    this.nodes = nodes;
}
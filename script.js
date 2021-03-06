//FB Script ******************************* start
window.fbAsyncInit = function() {
    FB.init({
        appId: '1511226939153366',
        xfbml: true,
        version: 'v2.2'
    });

    // ADD ADDITIONAL FACEBOOK CODE HERE
    function onLogin(response) {
        if (response.status == 'connected') {
            FB.api('/me?fields=first_name', function(data) {
                var welcomeBlock = document.getElementById('fb-welcome');
                welcomeBlock.innerHTML = "<b>" + data.first_name + '</b>! Catch YOU! ';
            });
        }
    }

    FB.getLoginStatus(function(response) {
        // Check login status on load, and if the user is
        // already logged in, go directly to the welcome message.
        if (response.status == 'connected') {
            onLogin(response);
        } else {
            // Otherwise, show Login dialog first.
            FB.login(function(response) {
                onLogin(response);
            }, {
                scope: 'user_friends, email'
            });
        }
    });
};

(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
        return;
    }
    js = d.createElement(s);
    js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));
//FB Script ******************************* End

//google map api *********************************************
$(function() {

    //利用canvas產生一個內含文字的圖檔
    function createMarkerIcon(text, opt) {
        //定義預設參數
        var defaultOptions = {
            fontStyle: "normal", //normal, bold, italic
            fontName: "Arial",
            fontSize: 12, //以Pixel為單位
            bgColor: "darkblue",
            fgColor: "white",
            padding: 4,
            arrowHeight: 6 //下方尖角高度
        };
        options = $.extend(defaultOptions, opt);
        //建立Canvas，開始幹活兒
        var canvas = document.createElement("canvas"),
            context = canvas.getContext("2d");
        //評估文字尺寸
        var font = options.fontStyle + " " + options.fontSize + "px " +
            options.fontName;
        context.font = font;
        var metrics = context.measureText(text);
        //文字大小加上padding作為外部尺寸
        var w = metrics.width + options.padding * 2;
        //高度以Font的大小為準
        var h = options.fontSize + options.padding * 2 +
            options.arrowHeight;
        canvas.width = w;
        canvas.height = h;
        //邊框及背景
        context.beginPath();
        context.rect(0, 0, w, h - options.arrowHeight);
        context.fillStyle = options.bgColor;
        context.fill();
        //畫出下方尖角
        context.beginPath();
        var x = w / 2,
            y = h,
            arwSz = options.arrowHeight;
        context.moveTo(x, y);
        context.lineTo(x - arwSz, y - arwSz);
        context.lineTo(x + arwSz, y - arwSz);
        context.lineTo(x, y);
        context.fill();
        //印出文字
        context.textAlign = "center";
        context.fillStyle = options.fgColor;
        context.font = font;
        context.fillText(text,
            w / 2, (h - options.arrowHeight) / 2 + options.padding);
        //傳回DataURI字串
        return canvas.toDataURL();
    }



    //計算兩個經緯座標間的距離(Haversine公式)
    function distHaversine(p1, p2) {
            var rad = function(x) {
                return x * Math.PI / 180;
            }
            var R = 6371; // earth's mean radius in km
            var dLat = rad(p2.lat() - p1.lat());
            var dLong = rad(p2.lng() - p1.lng());
            var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) * Math.sin(dLong / 2) * Math.sin(dLong / 2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            var d = R * c;
            return parseFloat(d.toFixed(3));
        }
        //消防分局資料陣列
    var branches = [];
    //取得分局資料(含經緯座標)，存為物作陣列
    var list =
        "Taipei Station-社團法人中華民國國際青年之家協會,(02)23311102,中正區北平西路3號,25.0477505,121.5170599\n" +
        "Taipei Station-新驛旅店台北車站前站店,(02)23148008,中正區懷寧街7號,25.046266,121.51426\n" +
        "Taipei Station-力歐時尚旅館,(02)23145296,中正區延平南路9號,25.046306,121.510901\n" +
        "Taipei Station-台北凱撒大飯店,(02)23115151,中正區忠孝西路一段38號,25.049451,121.516904\n" +
        "Taipei Station-台北青年國際旅館,(02)23113201,中正區許昌街19號,25.045681,121.516558\n" +
        "Taipei Station-大師會館,(02)25596777,大同區環河北路一段,25.048786,121.518569\n" +
        "Taipei Station-天成大飯店,(02)23617856,中正區忠孝西路一段43號,25.048786,121.518569\n" +
        "Taipei Station-璽愛旅店,(02)23516396,中正區忠孝西路一段72號,25.046844,121.514009\n" +
        "Taipei Station-福泰桔子商旅開封店,(02)23881523,中正區開封街一段41號,25.046128,121.51255\n" +
        "Taipei Station-捷絲旅西門町館,(02)23709000,中正區中華路一段41號,25.0449241,121.5094408\n" +
        "Taipei Station-喜苑旅店,(02)23887269,中正區重慶南路一段18號,25.0462109,121.513097\n" +
        "Taipei Station-城美大飯店,(02)23147305,中正區漢口街一段88號,25.045084,121.511916\n" +
        "Taipei Station-貝殼窩青年旅舍,(02)23882833,中正區懷寧街84號,25.0429659,121.513943\n" +
        "Taipei Station-台北凱撒大飯店,(02)23115151,中正區忠孝西路一段38號,25.0462585,121.5164218\n" +
        "Taipei Station-新驛旅店,(02)77327777,大同區長安西路77號,25.05108,121.516674";


    var lines = list.replace(/\r/g, "").split('\n');
    //lines[i]格式如下:
    //文山中隊-木柵分隊,(02)29391604,文山區木柵路2段200號,24.9890353,121.5630845
    for (var i = 0; i < lines.length; i++) {
        var parts = lines[i].split(',');
        branches.push({
            name: parts[0],
            tel: parts[1],
            addr: parts[2],
            latlng: new google.maps.LatLng(
                parseFloat(parts[3]), parseFloat(parts[4])),
            dist: 0
        });
    }
    getGeolocation();

    //解譯地址********************************
    function trunaddress(a, b) {
        //http://maps.googleapis.com/maps/api/geocode/json?latlng=25.046862299999997,121.5128437&sensor=true
        var gurl = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + a + "," + b + "&sensor=true";
        var result = null;

        $.ajax({
            url: gurl,
            type: 'get',
            dataType: 'json',
            async: false,
            success: function(data) {
                result = data;
            }
        });

        //console.log(result.results[0].formatted_address);
        return result.results[0].formatted_address

    }

    //***post telphone
    function posttelphone(add) {

        var gurl = "https://rest.nexmo.com/sms/json?api_key=2b947805&api_secret=75987550&from=NEXMO&to=886935952586&text=Your Honey in here![" + add + "]&type=unicode";
        //console.log("gurl  " + gurl);

        $.ajax({
            url: gurl,
            type: "POST",
            dataType: 'json',
            success: function(msg) {
                console.log(msg);
            },
            error: function(xhr, ajaxOptions, thrownError) {
                console.log(xhr.status);
                console.log(thrownError);
            }
        });
    }

    //send mail to you
    function senmailtoyou(add, x, y) {

        //http://maps.googleapis.com/maps/api/staticmap?center=25.0468495,121.51270500000001&zoom=16&size=600x300&maptype=roadmap&language=TW&markers=color:red%7Clabel:S%7C25.0468495,121.51270500000001&markers=color:green%7Clabel:G%7C25.0468495,121.51270500000001=false
        //'http://maps.googleapis.com/maps/api/staticmap?center='+x+','+y+'&zoom=16&size=600x300&maptype=roadmap&markers=color:red%7Clabel:S%7C'+x+','+y+'&markers=color:green%7Clabel:G%7C'+x+','+y+'=false'
        //console.log(x + ', ' + y);
        var gimg = 'http://maps.googleapis.com/maps/api/staticmap?center=' + x + ',' + y + '&zoom=16&size=600x300&maptype=roadmap&language=TW&markers=color:red%7Clabel:S%7C' + x + ',' + y + '&markers=color:green%7Clabel:G%7C' + x + ',' + y + '=false';
        //console.log(add);
        var mailhtml = '<h1>Your Honey or Baby in here!!!</h1><h2>' + add + '</h2><div><img src="' + gimg + '"></div>'

        $.ajax({
            type: 'POST',
            url: 'https://mandrillapp.com/api/1.0/messages/send.json',
            data: {
                'key': 'tXtr_OIX1LaJD5styt91rg',
                'message': {
                    'from_email': 'CatchMonkey@gmail.com',
                    'to': [{
                        'email': 'chentai008@yahoo.com',
                        'name': 'chen',
                        'type': 'to'
                    }, {
                        'email': 'sea392@yahoo.com.tw',
                        'name': 'sea',
                        'type': 'to'
                    }, {
                        'email': 'ray102467@gmail.com',
                        'name': 'ray',
                        'type': 'to'
                    }, {
                        'email': 'willy741026@gmail.com',
                        'name': 'Will',
                        'type': 'to'
                    }],
                    'autotext': 'true',
                    'subject': '[Catch Monkey] Dear Where!!!',
                    'html': mailhtml
                }
            }
        }).done(function(response) {
            //console.log(response);
            //if you're into that sorta thing
        });

    }

    //取得使用者目前位罝
    function getGeolocation() {
            //alert('llll');
            if (navigator && navigator.geolocation) {
                //getCurrentPosition屬非同步執行，要另定函數解析結果
                navigator.geolocation.getCurrentPosition(parsePosition);
            }
        }
        //解析getCurrentPosition傳回的結果
    function parsePosition(pos) {
        //標示點陣列
        var markers = [];
        //由pos.coords取出latitude及longitude
        var curLatLng = new google.maps.LatLng(
            pos.coords.latitude, pos.coords.longitude);

        //test**************************************************
        //console.log(pos.coords.latitude, pos.coords.longitude)
        var nowaddress = trunaddress(pos.coords.latitude, pos.coords.longitude);
        //console.log('nowaddress: ' + nowaddress);

        //分別計算對所有Branch的距離
        for (var i = 0; i < branches.length; i++) {
            var branch = branches[i];
            branch.distance = //計算兩個LatLng間的距離
                distHaversine(branch.latlng, curLatLng);
        }
        //依距離進行排序
        branches.sort(function(a, b) {
            if (a.distance == b.distance) return 0;
            return (a.distance > b.distance) ? 1 : -1;
        });
        //設定地圖參數
        var mapOptions = {
            center: curLatLng,
            mapTypeId: google.maps.MapTypeId.ROADMAP //正常2D道路模式
        };
        //在指定DOM元素中嵌入地圖
        var map = new google.maps.Map(
            document.getElementById("map_canvas"), mapOptions);
        //使用LatLngBounds統計檢視範圍
        var bounds = new google.maps.LatLngBounds();
        //加入使用者所在位置
        var marker = new google.maps.Marker({
            position: curLatLng,
            title: "現在位置",
            //借用前篇文章介紹的Canvas.toDataURL()產生動態圖檔作為圖示
            icon: createMarkerIcon("現在位置"),
            map: map
        });
        var h = [];
        var sendnotice = true;
        //因為已排序過，故會依距離由近到遠加入Marker
        for (var i = 0; i < branches.length; i++) {
            var b = branches[i];
            //距離最近的前五名加入檢視範圍

            //如果小於0.08就發出ALERT
            //console.log(b);
            if (b.distance <= 0.08) {
                alert("你是不是離「" + b.name + " 」太近了...該注意哦...!!!");
                //
                //console.log(nowaddress);

                if (sendnotice) {
                    alert('Your Address: ' + nowaddress);
                    //post to telphone function***********************************
                    //posttelphone(nowaddress);
                    senmailtoyou(nowaddress, pos.coords.latitude, pos.coords.longitude);
                    sendnotice = false;
                }

            }

            if (i < 5) bounds.extend(b.latlng);
            var marker = new google.maps.Marker({
                position: b.latlng,
                title: b.name, //以刻有分隊名稱的告示牌作為圖示
                icon: createMarkerIcon(b.name.split('-')[1],
                    //距離較近的前五名為紅底，其餘為暗紅底
                    {
                        bgColor: i < 5 ? 'red' : 'darkred'
                    }),
                map: map
            });
        }
        //調整檢視範圍
        map.fitBounds(bounds);
    }
});

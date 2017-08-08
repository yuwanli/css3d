require.config({
    paths : {
        "zepto" : "http://mat1.gtimg.com/zj/yuwanli/dzw1611/four/js/zeptoAll.min",
        "data" : "http://mat1.gtimg.com/zj/yuwanli/dzw1611/four/js/data.min",
        "orienter":"http://mat1.gtimg.com/zj/yuwanli/dzw1611/four/js/orienter.min",
        "css3d":"http://mat1.gtimg.com/zj/yuwanli/dzw1611/four/js/css3d.min",
        "jstween":"http://mat1.gtimg.com/zj/yuwanli/dzw1611/four/js/jstween.min",
        "audiojs":"http://mat1.gtimg.com/zj/yuwanli/dzw1608/qixi/js/audiojs/audio.min"
    },
    shim : {
        "zepto" : {
            exports : "$"
        },
        "data":{
            exports : "d"
        }
    }
});

var ratio = ratioGlobel/100;
var css3d;
var newCss3;
var winWidth = window.innerWidth;
var winHeight = window.innerHeight;
var a = 400*ratio;
var b = 400*ratio;
var orienter;
var canMove = false;
var firstFlag = false;
localhostPaht =  "http://vip.zjqq.mobi";
var reg_host = localhostPaht+"/index.php/";
var bgx = -(374*winHeight/568-winWidth)/2;

function isAndroid(){
    var ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
        return false
    } else if (/android/.test(ua)) {
        return false//android暂时不屏蔽动画
    }
}

var dotted_z = 200*ratio;
function go_one(){
    JT.to(css3d.dotted.el, 1, {
        onRepeat:false,
        ease: JT.Linear.None,
        onUpdate:function(){
            dotted_z = dotted_z - 4*ratio<=0?0:dotted_z - 4*ratio;
            css3d.dotted.position(0,0,dotted_z).updateT();
        },
        onEnd: function () {
            orienter.init();
        }
    });
}
var b = 0;
function go_two(){
    JT.to(css3d.camera.stage.el,1.5, {
        onRepeat:false,
        ease: JT.Linear.None,
        onUpdate:function(){
            a-=4*ratio;
            //css3d.n_s.position(0,0,a).updateT();
            //a-=4*ratio;
            css3d.camera.position(0,0,a).updateT();
            //if(!canMove){
            //    b = a;
            //    css3d.four.position(0,0,a-400*ratio).updateT();
            //    css3d.bgPlane.position(0,0,a-410*ratio).updateT();
            //}
            // else{
            //    if(a<b-410*ratio){
            //        initNext();
            //        JT.kill(css3d.camera.stage.el);
            //    }
            //}
        },
        onEnd: function () {
            $(".page1").hide();
            $("#box1").html(" ");
            $("#box1").remove();
            $(".videoCon").show();
            if(typeof WeixinJSBridge !== "undefined"){
                WeixinJSBridge.invoke('getNetworkType', {}, function (e) {
                    try{
                        document.querySelectorAll('video')[0].play();
                    }catch(e){
                    }
                });
            }else{
                document.querySelectorAll('video')[0].play();
            }

            //initNext();
            JT.kill(css3d.camera.stage.el);
        }
    });
}

function initNext(){
    css3d.end();
    $(".videoCon").remove();
    //$("#box2").fadeIn();
    newCss3.start();
}
function RndNum(n){
    var rnd="";
    for(var i=0;i<n;i++)
        rnd+=Math.floor(Math.random()*10);
    return rnd;
}
function selectFileImage(fileObj){
    var file = fileObj.files['0'];
    //图片方向角 added by lzk
    var Orientation = null;

    if (file) {
        var rFilter = /^(image\/jpeg|image\/png)$/i; // 检查图片格式
        if (!rFilter.test(file.type)) {
            alert("请选择jpeg、png格式的图片");
            return;
        }
        //获取照片方向角属性，用户旋转控制
        EXIF.getData(file, function() {
            EXIF.getAllTags(this);
            Orientation = EXIF.getTag(this, 'Orientation');
        });

        var oReader = new FileReader();
        oReader.onload = function(e) {
            var image = new Image();
            image.src = e.target.result;

            image.onload = function() {
                var expectWidth = this.naturalWidth;
                var expectHeight = this.naturalHeight;

                if (this.naturalWidth > this.naturalHeight && this.naturalWidth > 800) {
                    expectWidth = 800;
                    expectHeight = expectWidth * this.naturalHeight / this.naturalWidth;
                } else if (this.naturalHeight > this.naturalWidth && this.naturalHeight > 1200) {
                    expectHeight = 1200;
                    expectWidth = expectHeight * this.naturalWidth / this.naturalHeight;
                }
                var canvas = document.createElement("canvas");
                var ctx = canvas.getContext("2d");
                canvas.width = expectWidth;
                canvas.height = expectHeight;
                ctx.drawImage(this, 0, 0, expectWidth, expectHeight);

                var base64 = null;
                var mpImg = new MegaPixImage(image);
                mpImg.render(canvas, {
                    maxWidth: 800,
                    maxHeight: 1200,
                    quality: 0.8,
                    orientation: Orientation
                });
                base64 = canvas.toDataURL("image/jpeg", 0.8);

                $("#img").css("background-image","url("+base64+")");
                var timestamp = new Date().getTime();
                var user = timestamp + RndNum(4);
                var data = {
                    'user': user,
                    "img_base64":base64.replace(/^data:image\/(png|jpg|jpeg);base64,/, ""),
                    'setting' : "",
                    'duang' : ''
                }
                $.ajax({
                    type: "post",
                    url:"http://vip.zjqq.mobi/tool/base64ToImg",
                    data:data,
                    dataType:"json",
                    async: true,
                    error: function(request) {
                        showMyTips("提交失败，请重试");
                    },
                    success: function(data) {
                        console.log(data);
                        //
                        if(data.status=="ok"){
                            $("#img").css("background-image","url("+data.path+")");
                            $(".imgPath").val(data.path);
                            $(".imgPath_thumb").val(data.path);
                            $(".imgPath_thumb_big").val(data.path);
                        }else{
                            showMyTips(data.msg)
                        }

                    }
                });
            };
        };
        oReader.readAsDataURL(file);
    }
}
function create(){
    if(isAndroid()){
        return;
    }
    css3d.n_s = new C3D.Sprite();
    for(var i = 0;i<2;i++){
        var p = new C3D.Plane();
        p.size(310*ratio,402*ratio);
        p.rotation(Math.random()*10,Math.random()*10,Math.random()*100);
        p.position(Math.random()*100-50,-Math.random()*100,-i*100*ratio);
        p.material({
            image:"http://mat1.gtimg.com/zj/yuwanli/dzw1611/four/images/dotted2.png"
        });
        p.update();
        p.el.style.backgroundSize = "100% 100%";
        css3d.n_s.addChild(p);
    }
    css3d.stage.addChild(css3d.n_s);
}

/*判断设备来源*/
function check_source(){
    if(window.TencentNews){
        signSource = 1;		//判断是否来自腾讯客户端
    }else if(typeof WeixinJSBridge !== 'undefined'){
        signSource = 3;		//判断是否来自微信
    }/*else if(browser.versions.mobile){
     signSource = 2;		//判断是否来自手机端
     }*/else if(navigator.userAgent){
        signSource = 4;		//判断是否来自微信pc
    }else{
        signSource = 0;
    }
    return signSource;
}
function showMyTips(s){
    $(".tipsCon .tips p").html(s);
    $(".tipsCon").fadeIn();
}
//利用ajax post提交报名信息
function reg_new(activity_id){
    if(!$(".imgPath").val()){
        showMyTips("请上传一张照片");
        return;
    }
    $('#' + activity_id + '_reg_button').attr('disabled', 'disabled');
    var url = reg_host + 'sign/submit/' + activity_id;
    var signSource = check_source();
    //console.log($('#' + activity_id + '_reg_form').serialize());
    $.ajax({
        cache: false,
        type: "post",
        url:url,
        data:$('#' + activity_id + '_reg_form').serialize()+ '&data[signsource]='+ signSource + '&callback=reg_success_callback',
        async: false,
        error: function(request) {
            showMyTips("提交失败，请重试");
            $('#' + activity_id + '_reg_button').removeAttr('disabled');
        },
        success: function(data) {
            data = JSON.parse(data);
            if(data.result=="success"){
                showMyTips("提交成功");
                $(".tipsCon .tips .sure").on("tap",function(){
                    $(".tipsCon").fadeOut();
                    $(".page3").fadeOut();
                });
                return;
            }
            showMyTips(data.result);
            $('#' + activity_id + '_reg_button').removeAttr('disabled');
        }
    });
}


require(['zepto',"css3d","data","orienter","jstween","audiojs"],function($){
    Pace.on("hide", function (e) {
        $(".page1").addClass("active");
        $(".wordsCon,.buling").fadeIn();
        css3d.init();
        css3d.ininStatus();
        setTimeout(function(){
            newCss3.init();
        },2000)
    });
    window.makeVideoPlayableInline(document.querySelectorAll('video')[0], true, true);
    document.getElementById("container").addEventListener("touchstart",function(e){e.preventDefault()})
    css3d = {
        stage:'',
        init:function(){
            var _this = this;
            _this.stage = new C3D.Stage();
            _this.stage.size(winWidth, winHeight).update();
            _this.resize();
            //创建相机
            _this.camera = _this.stage.camera;
            _this.camera.position(0,0,400*ratio);

            _this.camera.stage.el.setAttribute("id","camera");
            _this.camera.update();
            _this.page1start();
        },
        ininStatus:function(){
            go_one();
        },
        page1start:function(){
            var _this = this;
            document.getElementById('box1').appendChild(_this.stage.el);
            _this.skybox = new C3D.Skybox();
            _this.skybox.size(800*ratio).position(0, 0, 0).update();
            _this.stage.addChild(_this.skybox);
            _this.sprite = new C3D.Sprite();

            _this.dotted = new C3D.Plane();
            _this.dotted.size(316*ratio,402*ratio);
            _this.dotted.material({
                image:"http://mat1.gtimg.com/zj/yuwanli/dzw1611/four/images/dotted.png"
            });
            _this.dotted.position(0,0,200*ratio);
            _this.dotted.el.style.backgroundSize = "100% 100%";
            _this.dotted.el.setAttribute("id","dotted");
            _this.stage.addChild(_this.dotted);
            _this.dotted.update();

            //_this.four = new C3D.Plane();
            //_this.four.size(50*ratio,61*ratio);
            //_this.four.position(0,0,0);
            //_this.four.material({
            //    image:"http://mat1.gtimg.com/zj/yuwanli/dzw1611/four/images/4.png"
            //});
            //_this.four.el.style.backgroundSize = "100% auto";
            //_this.four.update();
            //_this.stage.addChild(_this.four);
            //_this.four.el.style.display = "none";

            _this.bgPlane = new C3D.Plane();
            _this.bgPlane.size(600*ratio,800*ratio);
            _this.bgPlane.position(0,0,-10*ratio);
            _this.bgPlane.material({
                image:"http://mat1.gtimg.com/zj/yuwanli/dzw1611/four/images/page1_bg.jpg"
            });
            _this.bgPlane.el.style.backgroundSize = "100% auto ";
            _this.bgPlane.el.style.backgroundPosition = "center";
            _this.bgPlane.el.style.backgroundRepeat = "no-repeat";
            _this.bgPlane.update();
            _this.stage.addChild(_this.bgPlane);
            //_this.four.el.style.display = "none";

        },
        end:function(){
            $(window).unbind("resize");
        },
        resize:function(){
            var _this = this;
            _this.stage.size(window.innerWidth, window.innerHeight).update();
            $(window).bind("resize",function(){
                _this.resize();
            })
        }
    }
    newCss3 = {
        init:function(){
            var _this = this;
            _this.stage = new C3D.Stage();
            _this.stage.size(winWidth, winHeight).update();
            //_this.stage.camera.position(0,1000*ratio,0).rotation(-90,0,0);

            _this.conSprite = new C3D.Sprite();
            //_this.boxSkin = new C3D.Skybox();
            _this.photoBox = new C3D.Skybox();

            //_this.boxSkin.size(1000*ratio,2000*ratio,1000*ratio).material({
                //left:{image:"images/photo/b_01.png"},
                //back:{image:"images/photo/b_04.png"},
                //right:{image:"images/photo/b_03.png"},
                //front:{image:"images/photo/b_02.png"}
            //}).update();

            _this.photoBox.size(700*ratio,680*ratio,700*ratio).material({
                left:{image:"http://mat1.gtimg.com/zj/yuwanli/dzw1611/four/images/photo/b_01.png"},
                back:{image:"http://mat1.gtimg.com/zj/yuwanli/dzw1611/four/images/photo/b_04.png"},
                right:{image:"http://mat1.gtimg.com/zj/yuwanli/dzw1611/four/images/photo/b_03.png"},
                front:{image:"http://mat1.gtimg.com/zj/yuwanli/dzw1611/four/images/photo/b_02.png"}
            }).update();

            _this.photoBox.el.setAttribute("id","photoBox");
            //_this.boxSkin.el.setAttribute("id","boxSkin");
            _this.conSprite.el.setAttribute("id","conSprite");
            //for(var i = 0;i<4;i++){
            //    switch (i){
            //        case 0:
            //            for(var j = 0;j<5;j++){
            //                p = new C3D.Plane();
            //                var x1 = Math.sqrt((ratio*2000/Math.PI)*(ratio*2000/Math.PI)-ratio*ratio*10000)*Math.sin(Math.PI/10*j);
            //                var z1 = -1*Math.sqrt((ratio*2000/Math.PI)*(ratio*2000/Math.PI)-ratio*ratio*10000)*Math.cos(Math.PI/10*j);
            //                q = new C3D.Plane();
            //                var x2 = Math.sqrt((ratio*1400/Math.PI)*(ratio*1400/Math.PI)-(ratio*ratio*70*70))*Math.sin(Math.PI/10*j);
            //                var z2 = -1*Math.sqrt((ratio*1400/Math.PI)*(ratio*1400/Math.PI)-(ratio*ratio*70*70))*Math.cos(Math.PI/10*j);
            //
            //                p.position(x1,0,z1);
            //                q.position(x2,0,z2);
            //
            //                p.el.style.backgroundSize = "100% 100%";
            //                q.el.style.backgroundSize = "100% 100%";
            //
            //                p.size(ratio*200,ratio*2000).rotate(0,-18*j,0).material({
            //                    image:skyBox[j+7]
            //                }).update();
            //                q.size(ratio*140,ratio*700).rotate(0,-18*j,0).material({
            //                    image:photo[j+7]
            //                }).update();
            //
            //                _this.boxSkin.addChild(p);
            //                _this.photoBox.addChild(q);
            //            }
            //            break;
            //        case 1:
            //            for(var j = 0;j<5;j++){
            //                p = new C3D.Plane();
            //                var x1 = Math.sqrt((ratio*2000/Math.PI)*(ratio*2000/Math.PI)-ratio*ratio*10000)*Math.cos(Math.PI/10*j);
            //                var z1 = Math.sqrt((ratio*2000/Math.PI)*(ratio*2000/Math.PI)-ratio*ratio*10000)*Math.sin(Math.PI/10*j);
            //                q = new C3D.Plane();
            //                var x2 = Math.sqrt((ratio*1400/Math.PI)*(ratio*1400/Math.PI)-(ratio*ratio*70*70))*Math.cos(Math.PI/10*j);
            //                var z2 = Math.sqrt((ratio*1400/Math.PI)*(ratio*1400/Math.PI)-(ratio*ratio*70*70))*Math.sin(Math.PI/10*j);
            //
            //                p.position(x1,0,z1);
            //                q.position(x2,0,z2);
            //
            //                p.el.style.backgroundSize = "100% 100%";
            //                q.el.style.backgroundSize = "100% 100%";
            //
            //                p.size(ratio*200,ratio*2000).rotate(0,-18*j-90,0).material({
            //                    image:skyBox[j+12]
            //                }).update();
            //                q.size(ratio*140,ratio*700).rotate(0,-18*j-90,0).material({
            //                    image:photo[j+12]
            //                }).update();
            //
            //                _this.boxSkin.addChild(p);
            //                _this.photoBox.addChild(q);
            //            }
            //            break;
            //        case 2:
            //            for(var j = 0;j<5;j++){
            //                p = new C3D.Plane();
            //                var x1 = -1*Math.sqrt((ratio*2000/Math.PI)*(ratio*2000/Math.PI)-ratio*ratio*10000)*Math.sin(Math.PI/10*j);
            //                var z1 = Math.sqrt((ratio*2000/Math.PI)*(ratio*2000/Math.PI)-ratio*ratio*10000)*Math.cos(Math.PI/10*j);
            //                q = new C3D.Plane();
            //                var x2 = -1*Math.sqrt((ratio*1400/Math.PI)*(ratio*1400/Math.PI)-(ratio*ratio*70*70))*Math.sin(Math.PI/10*j);
            //                var z2 = Math.sqrt((ratio*1400/Math.PI)*(ratio*1400/Math.PI)-(ratio*ratio*70*70))*Math.cos(Math.PI/10*j);
            //
            //                p.position(x1,0,z1);
            //                q.position(x2,0,z2);
            //
            //                p.el.style.backgroundSize = "100% 100%";
            //                q.el.style.backgroundSize = "100% 100%";
            //
            //                var m = j+17>19?j-3:j+17;
            //                p.size(ratio*200,ratio*2000).rotate(0,-18*j-180,0).material({
            //                    image:skyBox[m]
            //                }).update();
            //                q.size(ratio*140,ratio*700).rotate(0,-18*j-180,0).material({
            //                    image:photo[m]
            //                }).update();
            //
            //                _this.boxSkin.addChild(p);
            //                _this.photoBox.addChild(q);
            //            }
            //            break;
            //        case 3:
            //            for(var j = 0;j<5;j++){
            //                p = new C3D.Plane();
            //                var x1 = -1*Math.sqrt((ratio*2000/Math.PI)*(ratio*2000/Math.PI)-ratio*ratio*10000)*Math.cos(Math.PI/10*j);
            //                var z1 = -1*Math.sqrt((ratio*2000/Math.PI)*(ratio*2000/Math.PI)-ratio*ratio*10000)*Math.sin(Math.PI/10*j);
            //                q = new C3D.Plane();
            //                var x2 = -1*Math.sqrt((ratio*1400/Math.PI)*(ratio*1400/Math.PI)-(ratio*ratio*70*70))*Math.cos(Math.PI/10*j);
            //                var z2 = -1*Math.sqrt((ratio*1400/Math.PI)*(ratio*1400/Math.PI)-(ratio*ratio*70*70))*Math.sin(Math.PI/10*j);
            //
            //                p.position(x1,0,z1);
            //                q.position(x2,0,z2);
            //
            //                p.el.style.backgroundSize = "100% 100%";
            //                q.el.style.backgroundSize = "100% 100%";
            //
            //                p.size(ratio*200,ratio*2000).rotate(0,-18*j-270,0).material({
            //                    image:skyBox[j+2]
            //                }).update();
            //                q.size(ratio*140,ratio*700).rotate(0,-18*j-270,0).material({
            //                    image:photo[j+2]
            //                }).update();
            //
            //                _this.boxSkin.addChild(p);
            //                _this.photoBox.addChild(q);
            //            }
            //            break;
            //        default :
            //            break;
            //    }
            //}

            //_this.conSprite.addChild(_this.boxSkin);
            _this.conSprite.addChild(_this.photoBox);
            _this.stage.addChild(_this.conSprite);
            document.getElementById('box2').appendChild(_this.stage.el);
            if(isAndroid()){
                return;
            }
            _this.conSprite.position(0,0,-1000*ratio).rotation(90,0,0).update();
        },

        start:function(){
            var _this = this;
            _this.startX = 0;
            _this.y = 0;
            setTimeout(function(){
                firstFlag = true;
            },2000);
            if(isAndroid()){
                return;
            }
            JT.fromTo(_this.conSprite.el,2,{
                    z:-1000*ratio,
                    rotationX:90
                },{
                    z:0,
                    rotationX:0,
                    onEnd: function () {
                        $(".tipsBox").show();
                        setTimeout(function(){
                            $(".tipsBox").fadeOut();
                            $(".handCon").fadeIn();
                        },1000)
                    }
                }
            );
            JT.fromTo(_this.photoBox.el,2,{
                    rotationY:0
                },{
                    z:0,
                    rotationY:360
                }
            );
            //JT.fromTo(_this.boxSkin.el,2,{
            //        rotationY:0
            //    },{
            //        z:0,
            //        rotationY:-360
            //    }
            //);
        },
        moveOut:function(){
            $(".handCon").hide();
            //$(".videoCon").remove();
            var _this = this
            JT.fromTo(_this.conSprite.el,2,{
                    scaleX:1,
                    scaleY:1,
                    scaleZ:1,
                    z:0,
                    rotationX:0
                },{
                    z:-1000*ratio,
                    scaleX:0,
                    scaleY:0,
                    scaleZ:0,
                    rotationX:90,
                    onEnd: function () {
                        //orienter.init()
                        $(".page2").addClass("in");
                        $("#box2").remove();
                        _this.end();
                    }
                }
            );
            JT.fromTo(_this.photoBox.el,2,{
                    rotationY:_this.photoBox.rotationY
                },{
                    z:0,
                    rotationY:_this.photoBox.rotationY+360
                }
            );
            //JT.fromTo(_this.boxSkin.el,2,{
            //        rotationY:_this.boxSkin.rotationY
            //    },{
            //        z:0,
            //        rotationY:_this.boxSkin.rotationY-360
            //    }
            //);
        },
        end:function(){
            $("#box1").html(" ");
        },
        resize:function(){
            var _this = this;
            _this.stage.size(window.innerWidth, window.innerHeight).update();
            window.onresize = function () {
                _this.resize();
            };
        }
    }
    $(".num").css("background-image","url("+num_src+")");
    $(".bg").css({
        "background-position-x":bgx+"px"
    })
    $(document).on("touchstart",".page1,.page2,.box1",function(e){e.preventDefault()});
    $(".num")[0].addEventListener("webkitAnimationEnd",function(){
        //$(".numBox").hide();
        go_two();
        //canMove = true;
    });
    $(".ready")[0].addEventListener("webkitAnimationEnd",function(){

        create();
        $(".breath").fadeIn();
        $(".page1").one("tap",function(){
            $(".page1").addClass('out');
            $(".bottom").fadeIn();


            setTimeout(function(){
                $(".numCon").show();
                //go_two();
            },1000);
        })
    });
    orienter = new Orienter();
    var firstOri = true;
    var initOri = 0;
    var flag = true;
    orienter.orient = function (e) {
        if(firstOri){
            initOri = e.g;
            firstOri = false;
        }
        if(firstFlag){
            initA = e.a;
            firstFlag = false;
        }
        try{
            //newCss3.boxSkin.rotation(0, e.a-initA,0).updateT();
            newCss3.photoBox.rotation(0, initA-e.a,0).updateT();
        }catch(e){

        }
        if(e.g*0.4<5&&e.g*0.4>-5){
            css3d.camera.rotation(0,e.g*0.4,0).updateT();
            css3d.dotted.position(-e.g*4,0,0).updateT();
        }
    };
    //var newFlag = true;
    //$(document).on("touchstart","#photoBox",function(e){
    //    if(flag){
    //        flag = false;
    //    }
    //    var el = e.targetTouches[0];
    //    newCss3.startX = el.pageX;
    //});
    //$(document).on("touchmove","#photoBox",function(e){
    //    var el = e.targetTouches[0];
    //    var b = -(el.pageX-newCss3.startX)*0.01;
    //    newCss3.y += b;
    //    newCss3.photoBox.rotation(0,newCss3.y*2,0).updateT();
    //});
    //$(document).on("touchend","#photoBox",function(e){
    //    var el = e.changedTouches[0];
    //    newCss3.startX = el.pageX;
    //});
    audiojs.events.ready(function() {
        var as = audiojs.create(document.getElementsByTagName("audio")[0],{
            css:false,
            createPlayer: {
                markup: false,
                playPauseClass: 'play-pauseZ',
                scrubberClass: 'scrubberZ',
                progressClass: 'progressZ',
                loaderClass: 'loadedZ',
                timeClass: 'timeZ',
                durationClass: 'durationZ',
                playedClass: 'playedZ',
                errorMessageClass: 'error-messageZ',
                playingClass: 'playingZ'
            }
        });
    });
    document.querySelectorAll('video')[0].addEventListener("ended",function(){
        $(".videoCon").remove();
        $("#box2").css("opacity","1");
        initNext();

    })
    $(document).one("tap",".handCon",function(e){
        $(document).off("touchmove","#photoBox");
        $(document).off("touchstart","#photoBox");
        $(document).off("touchend","#photoBox");
        orienter.destroy();
        newCss3.moveOut();
    });
    $(document).on("tap",".fromCon form i",function(e){
        $(".page3").fadeOut();
    });
    $(".tipsCon .tips .sure").on("tap",function(){
        $(".tipsCon").fadeOut();
    });
    $(document).on("tap",".page2",function(){
        $(".page3").fadeIn()
    });
    $(document).on("tap",".tipsBox",function(){
        $(".tipsBox").fadeOut();
        $(".handCon").fadeIn();
    })
})

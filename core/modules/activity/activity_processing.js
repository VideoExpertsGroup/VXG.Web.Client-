$( document ).ready(function() {
    var activity_window = window.opener;

    var thumburl = activity_window.event_processing.thumb_url ? activity_window.event_processing.thumb_url : "core/modules/cameras/camera.svg";
    var cameraName = activity_window.event_processing.camera_name;
    var location = activity_window.event_processing.location;
    var token = activity_window.event_processing.token;    
    var filemeta_download = activity_window.event_processing.filemeta_download;
    var tags = activity_window.event_processing.tags ? JSON.parse(atob(activity_window.event_processing.tags)) : null;
    var meta = activity_window.event_processing.meta ? JSON.parse(atob(activity_window.event_processing.meta)) : null;
    var eventId = activity_window.event_processing.event_id;
    var eventName = activity_window.event_processing.event_name;
    var eventDisplayName = activity_window.event_processing.display_name;
    var eventTime = activity_window.event_processing.time;
    var eventStatus = activity_window.event_processing.event_status;

    var userEmail = activity_window.event_processing.user_email;

    $(".event-time").html(eventTime);
    $(".event-camera").html(cameraName);
    $(".event-loc").html(location);
    $(".event-type").html(eventDisplayName);
    $(".event-status").html(eventStatus == "no_status" ? "New" : eventStatus);

    $(".event-thumbnail").attr("src", thumburl);
    $(".raw-data").text(atob(activity_window.event_processing.meta));

    if (eventStatus == "In Progress" || eventStatus == "Completed") {
        if (meta.result == "true") $("#check-true").attr("checked", true);
        if (meta.result == "false") $("#check-false").attr("checked", true);
        if (meta.description) $(".event-description").val(meta.description);
        $('.processing-cont').show();
    }

    if (eventStatus == "Completed") {
        $(".processing-input").attr("disabled", true);
    }
    
    getEventVideo(token, eventTime).then(function(ret) {
        var videoSources = "";
        ret.objects.forEach(video => {
            videoSources += `<source src="${video.url}" type="video/mp4"> `;
        })
        $('#event-video').html(videoSources);
    }, function(err) {
        console.log(err.responseText);
    });

    if (eventName == "vehicle_stopped_detection") {
        // show meta bounding boxes
        $('.tags-label').hide();
        if (meta.bounding_boxes && meta.frame_resolution) {
            var boundStr = meta.bounding_boxes.replaceAll("u'", "'").replaceAll("'", '"');
            var boundingBoxes = JSON.parse(boundStr);
            var resStr = meta.frame_resolution.replaceAll("u'", "'").replaceAll("'", '"')
            var originalRes = JSON.parse(resStr);
            setTimeout(function() { show_rect_bounding_boxes(boundingBoxes, originalRes);}, 500);
        }
    } else if (eventName == "plate_recognition") {
        // show car info
        var carInfo = `
            <p class="car-info"> 
                <b> ${(meta.license_plate ? meta.license_plate : "unknown")} </b>, car brand: ${(meta.car_brand ? meta.car_brand : "unknown")}, 
                car color: ${(meta.car_color ? meta.car_color : "unknown")}, car model: ${(meta.car_model ? meta.car_model : "unknown")}
            </p>
        `;
        $('.metaTags').html(carInfo);

    } else if (eventName == "object_and_scene_detection" || eventName == "yolov4_detection") {
        if (filemeta_download) {
            getFileMeta(filemeta_download).then(function(filemeta) { 
                $('.metaText').val(JSON.stringify(filemeta,'','  '));
                createMetaList(tags, eventName, true);   
            }, function(err) {
                console.log(err.responseText);
            })
        } else {
            createMetaList(tags, eventName, false);   
        }    
    } else {
        createMetaList(tags, eventName, false); 
    }

    window.playback_player = new CloudPlayerSDK('live-player', {
        autohide: 3000,
        timeline: true,
        disableZoomControl: false,
        disableAudioControl: false,
        disableGetShot: false,
        disableGetClip: false
    });
	playback_player.setSource(token);

    $('.start-btn').click(function() {
        // change processing status to in_progress
        $.getJSON("https://api.ipify.org?format=json",
            function (data) {
                var updateMetaFunctions = [];
                if (eventStatus == "no_status") {
                    updateMetaFunctions.push(createMetaTag(eventId, token, {"tag": "process", "data": "in_progress"}));
                } else {
                    updateMetaFunctions.push(updateMetaTag(eventId, token, "process", {"data": "in_progress"}));
                    updateMetaFunctions.push(removeMetaTag(eventId, token, "status_not_handled"));
                }
        
                updateMetaFunctions.push(createMetaTag(eventId, token, {"tag": "status_in_progress", "data": ""}));
                updateMetaFunctions.push(createMetaTag(eventId, token, {"tag": "user_id", "data": userEmail}));
                updateMetaFunctions.push(createMetaTag(eventId, token, {"tag": "user_"+userEmail, "data": ""}));
                updateMetaFunctions.push(createMetaTag(eventId, token, {"tag": "ip_address", "data": data.ip}));
                var start = new Date();
                updateMetaFunctions.push(createMetaTag(eventId, token, {"tag": "start_time", "data": start.toISOString()}));
        
                Promise.all(updateMetaFunctions).then(function() {
                    $('.processing-cont').show();
                }, function(err) {
                    alert("Error occured while updating event: " + err.responseText);
                });
            })
    });

    $('.end-btn').click(function() {
        var updateMetaFunctions = [];

        var alarmStatus = $('input[name="alarm-status"]:checked').val();
        var description = $('.event-description').val();

        if (alarmStatus) {
            updateMetaFunctions.push(checkAndSaveTag(eventId, token, "result", meta.result, alarmStatus));
            var resultSearch = alarmStatus === "true" ? "result_true" : "result_false";
            if (resultSearch === "result_true" && meta.result_false === "") updateMetaFunctions.push(removeMetaTag(eventId, token, "result_false"));
            if (resultSearch === "result_false" && meta.result_true === "") updateMetaFunctions.push(removeMetaTag(eventId, token, "result_true"));

            if (meta[resultSearch] === undefined) updateMetaFunctions.push(createMetaTag(eventId, token, {"tag": resultSearch, "data": ""}));
        }
        if (description) updateMetaFunctions.push(checkAndSaveTag(eventId, token, "description", meta.description, description));

        updateMetaFunctions.push(updateMetaTag(eventId, token, "process", {"data": "processed"}));
        updateMetaFunctions.push(createMetaTag(eventId, token, {"tag": "status_processed", "data": ""}));
        updateMetaFunctions.push(removeMetaTag(eventId, token, "status_in_progress"));

        var end = new Date();
        updateMetaFunctions.push(createMetaTag(eventId, token, {"tag": "end_time", "data": end.toISOString()}));

        Promise.all(updateMetaFunctions).then(function() {
            console.log("Changed event processing status to in_progress");
            window.opener.location.reload(false);
            window.close();
        }, function(err) {
            console.log("Error changing processing status: " + err.responseText);
        });
    });

    $('.save-btn').click(function() {
        var updateMetaFunctions = [];
        
        var alarmStatus = $('input[name="alarm-status"]:checked').val();
        var description = $('.event-description').val();

        if (alarmStatus) {
            updateMetaFunctions.push(checkAndSaveTag(eventId, token, "result", meta.result, alarmStatus));
            var resultSearch = alarmStatus === "true" ? "result_true" : "result_false";
            if (resultSearch === "result_true" && meta.result_false === "") updateMetaFunctions.push(removeMetaTag(eventId, token, "result_false"));
            if (resultSearch === "result_false" && meta.result_true === "") updateMetaFunctions.push(removeMetaTag(eventId, token, "result_true"));
            if (meta[resultSearch] === undefined) updateMetaFunctions.push(createMetaTag(eventId, token, {"tag": resultSearch, "data": ""}));
        }
        if (description) updateMetaFunctions.push(checkAndSaveTag(eventId, token, "description", meta.description, description));

        Promise.all(updateMetaFunctions).then(function() {
            console.log("Changed event processing status to in_progress");
            window.opener.location.reload(false);
            window.close();
        }, function(err) {
            console.log("Error changing processing status: " + err.responseText);
        });
    })

    $('.show-btn').click(function() {
        $('.raw-data-cont').toggle();
    });
});

async function checkAndSaveTag(eventId, token, tagKey, currentTagVal, newTagVal) {
    if (currentTagVal) {
        updateMetaTag(eventId, token, tagKey, {"data": newTagVal}).then(function() { 
            console.log('Successfully saved tag'); 
        }, function(err) {
            alert("Error saving tag: " + err.responseText)
        });
    } else {
        createMetaTag(eventId, token, {"tag": tagKey, "data": newTagVal}).then(function() { 
            console.log('Successfully updated tag'); 
        }, function(err) {
            alert("Error updating tag: " + err.responseText)
        });
    }
}

async function createMetaTag(eventId, accessToken, proccessingData) {
    let base_url = getBaseURLFromToken(accessToken);
    if (!base_url) 
        return new Promise(function(resolve, reject){setTimeout(function(){reject();}, 0);});

    var storageUrl = `${base_url}/api/v2/storage/events/${eventId}/meta/`

    return $.ajax({
        type: 'POST',
        url: storageUrl,
        headers: {'Authorization': 'Acc ' + accessToken},
        contentType: "application/json",
        data: JSON.stringify(proccessingData)
    });
}

async function updateMetaTag(eventId, accessToken, tagName, data) {
    let base_url = getBaseURLFromToken(accessToken);
    if (!base_url) 
        return new Promise(function(resolve, reject){setTimeout(function(){reject();}, 0);});

    var storageUrl = `${base_url}/api/v2/storage/events/${eventId}/meta/${tagName}`;

    return $.ajax({
        type: 'PUT',
        url: storageUrl,
        headers: {'Authorization': 'Acc ' + accessToken},
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data)
    });
}

async function removeMetaTag(eventId, accessToken, tagName) {
    let base_url = getBaseURLFromToken(accessToken);
    if (!base_url) 
        return new Promise(function(resolve, reject){setTimeout(function(){reject();}, 0);});

    var storageUrl = `${base_url}/api/v2/storage/events/${eventId}/meta/${tagName}`

    return $.ajax({
        type: 'DELETE',
        url: storageUrl,
        headers: {'Authorization': 'Acc ' + accessToken},
        contentType: "application/json",
    });
}

function createMetaList(tags, eventName, hasFileMeta) {
    var visual = false;
    // or there's something called "bounding box" in the meta?
    if (eventName=== 'object_and_scene_detection' || eventName === "yolov4_detection")
        visual = true;

    var tags_html = '';
    for (let i in tags){
        var v;
        if (visual == true)  
            v =  tags[i] > 0 ? '<a href="javascript:void(0)" data-name="'+i+'">'+i+'&nbsp;('+tags[i]+')</a>' : i ;
        else 
           v =  tags[i] > 0 ? i+'&nbsp;('+tags[i]+')' : i ;
               
        tags_html += (tags_html?', ':'') + v;
    }

    if (tags_html == '') $('.tags-label').hide();

    $('.metaTags').html(tags_html);

    $('.metaTags a').click(function(){
        if (hasFileMeta) {
            // won't connect properly to camerameta.js for some reason
/*          var activity_window = window.opener;
            var metascreen = activity_window.event_processing.metascreen
            metascreen.show_rect(this.dataset.name, eventName); */
            show_rect(this.dataset.name, eventName);
        }
    });
}

/*async function editMeta(eventId, accessToken, meta) {
    let base_url = getBaseURLFromToken(accessToken);
    if (!base_url) 
        return new Promise(function(resolve, reject){setTimeout(function(){reject();}, 0);});

    var storageUrl = `${base_url}/api/v2/storage/events/${eventId}/`

    return $.ajax({
        type: 'PUT',
        url: storageUrl,
        headers: {'Authorization': 'Acc ' + accessToken},
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(meta)
    });
}*/

async function getFileMeta(filemeta_download) {
    return $.ajax({
        type: "GET",
        url: filemeta_download,
        cache: true,
        dataType: 'json'
    });
}

async function getEventVideo(access_token, startTime) {
    let base_url = getBaseURLFromToken(access_token);
    if (!base_url) 
        return new Promise(function(resolve, reject){setTimeout(function(){reject();}, 0);});
    let args = {};

    var endTimeInt = new Date(startTime).getTime() + 1*60*1000;
    var endTime = new Date(endTimeInt).toISOString();
    var storageUrl = `${base_url}/api/v2/storage/data/?start=${startTime}&end=${endTime}&order_by=-time`;

    return $.ajax({
        type: 'GET',
        url: storageUrl,
        headers: {'Authorization': 'Acc ' + access_token},
        contentType: "application/json",
        data: args
    });
}

function show_rect(name, type) {
    var data =  $('.metaText').val();
    // Check if the data is available 
    if (type === 'object_and_scene_detection')
         return show_rect_aws_object_and_scene_detection(data, name);
    else if (type === 'yolov4_detection')
        return show_rect_yolo_object_detection(data, name);     

    alert("The visualisation is not supported by the chosen AI : '" + type + "'");     
    return;
}

function show_rect_bounding_boxes(boundingBoxes, frameRes) {
    img_w = $('.metaImg')[0].width;
    img_h = $('.metaImg')[0].height;

    res_w = frameRes.width;
    res_h = frameRes.height;

    var ctx = '<svg viewbox="0 0 ' + img_w + ' ' + img_h + '" style="position:absolute; top:0px; left:0px">';
    for (var key in boundingBoxes) {
        //if (boundingBoxes[key] == boxId) {
            w = (boundingBoxes[key][0] / res_w)*img_w;
            h = (boundingBoxes[key][1] / res_h) *img_h
            l = (boundingBoxes[key][2] / res_w) *img_w;
            t = (boundingBoxes[key][3] / res_h)*img_h;
            ctx += "<rect x='"+ l +"' y='"+ t +"' width='"+ w + "' height='"+ h +"' ";
            ctx += "style='fill:blue;stroke:#a0cf4d;stroke-width:3;fill-opacity:0.01;stroke-opacity:0.9'></rect>";
        //}
    }
    ctx += "</svg>"
    $('.metaSvg').html(ctx);
    return;
}

function show_rect_aws_object_and_scene_detection(ai_json, name)
{

    var data = JSON.parse(ai_json);

    img_w = $('.metaImg')[0].width;
    img_h = $('.metaImg')[0].height;

    var ctx = '<svg viewbox="0 0 ' + img_w + ' ' + img_h + '" style="position:absolute; top:0px; left:0px">';

    for (var key in data['Labels']){
        var label = data['Labels'][key];
        if (label.Name === name)
            for (var key in label['Instances'])
            {
                var instance = label['Instances'][key];			
                //print(instance['BoundingBox']['Width'])
                w = instance['BoundingBox']['Width']*img_w;
                h = instance['BoundingBox']['Height']*img_h
                l = instance['BoundingBox']['Left']*img_w;
                t = instance['BoundingBox']['Top']*img_h
                ctx += "<rect x='"+ l +"' y='"+ t +"' width='"+ w + "' height='"+ h +"' "
                ctx += "style='fill:blue;stroke:#a0cf4d;stroke-width:3;fill-opacity:0.01;stroke-opacity:0.9'></rect>"
            }
        }
        ctx += "</svg>"

    $('.metaSvg').html(ctx);
}

function show_rect_yolo_object_detection(ai_json, name){
    var data = JSON.parse(ai_json);

    c_w =  $('.metaImg')[0].width/$('.metaImg')[0].naturalWidth;
    c_h =  $('.metaImg')[0].height/$('.metaImg')[0].naturalHeight;

    img_w = $('.metaImg')[0].width;
    img_h  = $('.metaImg')[0].height;

    var ctx = '<svg viewbox="0 0 ' + img_w + ' ' + img_h + '" style="position:absolute; top:0px; left:0px">';

    if (data['data']['bounding-boxes'])
    data['data']['bounding-boxes'].forEach(function(item){
                if (item.ObjectClassName.toUpperCase() == name.toUpperCase())
                {
                    var width = item['coordinates']['right'] - item['coordinates']['left'];
                    var height = item['coordinates']['bottom'] - item['coordinates']['top'];
                    w = width * c_w;
                    h = height * c_h;
                    l = item['coordinates']['left'] * c_w;
                    t = item['coordinates']['top'] * c_h;

                    ctx += "<rect x='"+ l +"' y='"+ t +"' width='"+ w + "' height='"+ h +"' ";
                    ctx += "style='fill:blue;stroke:#a0cf4d;stroke-width:3;fill-opacity:0.01;stroke-opacity:0.9'></rect>";
                }
    });
    
    ctx += "</svg>";

    $('.metaSvg').html(ctx);
} 

function getBaseURLFromToken(access_token) {
    let _at;
    try{
    _at = JSON.parse(atob(access_token));
    } catch(e){};
    if (!_at) return '';
    let _url = _at['api'] ? _at['api'] : vxg.api.cloud.apiSrc;
    if (_url === vxg.api.cloud.apiSrc) {
        return _url;
    }
    let port = location.protocol=='https:' ? (_at['api_sp'] ? ':' + _at['api_sp'] : "") : (_at['api_p'] ? ':' + _at['api_p'] : "");
    return location.protocol+"//" + _url + port +(_at['path']?'/'+_at['path']:'');
}

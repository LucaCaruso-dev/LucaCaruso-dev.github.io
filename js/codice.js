function caricahome() {
    jQuery.get('https://logisim.altervista.org/LogisimData/Download/download.php', {  'Access-Control-Allow-Origin': '*' }, function (data) {
        $("#downlaods").text(data.toString());
    });
    jQuery.get('https://logisim.altervista.org/LogisimData/OnlineUsers/online.php', function (data) {
        $("#onlineusers").text(data.toString());
    });
    jQuery.get('https://logisim.altervista.org/LogisimData/Autoupdates/autoupdates.php', function (data) {
        $("#update").text(data.toString());
    });

    $y = $("input[type='radio'][name='file']:checked").val();
    $("#filename").text("Logisim-Fork." + $y);
    $("input[type='radio'][class='nobox']:checked").each(function () {
        $(this).parent(".version").css("border", "4px solid white");
    });
}

$(document).ready(function () {
    let ls = localStorage.getItem("videoId");
    var videoId = ls != null ? ls : $(".s").attr("videodefault"); //Se non è stato salvato alcun dato in localStorage metto il video di default
    localStorage.clear();

    caricahome();

    $(".video iframe").attr("src", "https://www.youtube.com/embed/"+videoId+"?autoplay=1");    

    $(".indice").on('click', function() {
        videoId = $(this).attr("value");
        $(".video iframe").attr("src", "https://www.youtube.com/embed/"+videoId+"?autoplay=1");
    });

    $(".changelink").on("click", function() {
        videoId = $(this).attr("value");
        localStorage.setItem("videoId", videoId); //Salvo il dato per accedervi dalla pagina dei tutorial
    });

    $(".logo").click(function () {
        $(window.location).attr('href', '/');
    });

    $(".star").click(function () {
        window.open('https://github.com/Logisim-Ita/Logisim/stargazers','_blank');
    }); 

    $(document).on('click', '.pluginsection.n',function () {
        let clicked = $(this).attr("value");
        let prev = $(".pluginsection.s").attr("value");
        $("#"+clicked).show();
        $("#"+prev).hide();
        $(".pluginsection.s").removeClass('s').addClass('n');
        $(this).removeClass('n').addClass('s'); 
    });
    
    $(document).on('change', 'input[type="radio"][class="nobox"]',function () {
        $("input[type='radio'][class='nobox']:not(:checked)").each(function () {
            $(this).parent(".version").css("border", "4px solid #00C000");
        });
        $("input[type='radio'][class='nobox']:checked").each(function () {
            $(this).parent(".version").css("border", "4px solid white");
        });
        $y = $("input[type='radio'][name='file']:checked").val();
        $("#filename").text("Logisim-Fork." + $y);
    });

});
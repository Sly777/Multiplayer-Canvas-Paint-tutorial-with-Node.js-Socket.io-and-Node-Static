// http://blog.ilkerguller.com
// Ilker Guller

$(document).ready(function() {
    if(!Modernizr.canvas) { // Modernizr ile Tarayıcı canvas ozelligi destekliyor mu kontrol ediyoruz
        alert("Maalesef tarayıcın canvas'ı desteklemiyor. Mümkünse chrome yada firefox üzerinde dene.");
        return false;
    }

    var ayarlar = {
        sayfa   : $(document),                          // Sayfa bilgileri
        pencere : $(window),                            // Pencere bilgileri
        canvas  : $('#cizimEkrani'),                    // Canvas bilgileri
        ctx     : $('#cizimEkrani')[0].getContext('2d'),// Canvas icerigi
        kId     : Math.round($.now() * Math.random()),  // Kullanici icin ID
        cDurumu : false,                                // Cizim durumu
        renkKodu: Math.floor((Math.random() * 255) + 1) + "," + Math.floor((Math.random() * 255) + 1) + "," + Math.floor((Math.random() * 255) + 1) // Kullaniciya ozel renk
    };

    var genel = {
        cizimYap : function(fromx, fromy, tox, toy, renkKodu){      // cizim yap
            ayarlar.ctx.beginPath();                                // cizime basla
            ayarlar.ctx.moveTo(fromx, fromy);                       // baslangic noktasi
            ayarlar.ctx.lineTo(tox, toy);                           // gidecegi nokta
            ayarlar.ctx.lineWidth = 3;                              // cizgi boyutu
            ayarlar.ctx.strokeStyle = "rgba(" + renkKodu + ", 1)";  // cizgi rengi
            ayarlar.ctx.stroke();                                   // ciz
        },
        telefonMu : function(e){                                                                // touch telefon mu kontrol et
            if(typeof(event) != "undefined" && typeof(event.targetTouches) != "undefined"){     // eger touch fonksiyonlarini destekliyorsa...
                e = event.targetTouches[0];                                                     // default mouse bilgilerini touch ile degistir
                event.preventDefault();                                                         // touch event'inin standardini kaldir, yazdigimiz fonksiyonu calistir
                return e;                                                                       // touch bilgilerini gonder
            }
            e.preventDefault();     // mouse event'inin standardini kaldir, yazdigimiz fonksiyonu calistir
            return e;               // mouse bilgisini gonder
        },
        bilgiGonder : function(_e, _baslangic){     // socket ile bilgi gonder
            genel.socket.emit('hareketiGonder', {   // 'hareketiGonder' fonksiyonu ile datayi yolla
                'x': _e.pageX,                      // noktanin x pozisyonu
                'y': _e.pageY,                      // noktanin y pozisyonu
                'cDurum': ayarlar.cDurumu,          // cizim yapiyor mu yoksa yapmiyor mu?
                'kId': ayarlar.kId,                 // kullanici id'si
                'renkKodu': ayarlar.renkKodu,       // kullanici rengi
                'baslangic': _baslangic             // baslangic noktasi mi?
            });
        },
        kullanicilar: {}, // kullanicilar
        socket: io.connect("http://" + document.location.host || "http://localhost:8080") // socket baglanti adresi
    };

	var biOnceki = {}; // bir onceki cizim noktasi
    ayarlar.canvas.bind('mousedown touchstart',function(e){
        e = genel.telefonMu(e);
        ayarlar.cDurumu = true;     // cizime basladi
        biOnceki.x = e.pageX;
        biOnceki.y = e.pageY;
        genel.bilgiGonder(e, true); // cizime basladi bilgisi server'a gonderilir
    });

    ayarlar.canvas.bind('mouseup mouseleave touchend',function(e){
        e = genel.telefonMu(e);
        ayarlar.cDurumu = false;    // cizim bitti
    });

    ayarlar.canvas.bind('mousemove touchmove',function(e){
        e = genel.telefonMu(e);

        if(ayarlar.cDurumu){                // cizim basladi mi?
            genel.bilgiGonder(e, false);    // cizim devam ediyor bilgisi server'a gonderilir

            genel.cizimYap(biOnceki.x, biOnceki.y, e.pageX, e.pageY, ayarlar.renkKodu); // Cizimi yap
            biOnceki.x = e.pageX;
            biOnceki.y = e.pageY;
        }
    });

    genel.socket.on('hareketiCiz', function (data) {    // socket'ten hareketiCiz cagirisi gelince...
        if(typeof(genel.kullanicilar[data.kId]) == "undefined" || data.baslangic == true) { // eger kullanici yaratilmamis veya baslangic yapilmissa
            genel.kullanicilar[data.kId] = data;        // kullanicinin datasini array'e at
        }

        if(data.cDurum){ // cizim yapiyor mu?
            genel.cizimYap(genel.kullanicilar[data.kId].x, genel.kullanicilar[data.kId].y, data.x, data.y, data.renkKodu);
            genel.kullanicilar[data.kId] = data;
        }
    });
});

// http://blog.ilkerguller.com
// Ilker Guller
// [NCMB] APIキー設定
var applicationKey = "YOUR_NCMB_APPLICATION_KEY";
var clientKey = "YOUR_NCMB_CLIENT_KEY";

// [NCMB] SDKの初期化
var ncmb = new NCMB(applicationKey, clientKey);

// [NCMB] ログイン中ユーザー
var currentLoginUser;

// [NCMB] つぶやきデータ
var tsubuyakiData;

// [NCMB] ユーザーデータ
var userData;


/********** ID / PW 認証 **********/
// 【ID / PW 認証】「登録する」ボタン押下時の処理
function onIDRegisterBtn() {
    // 入力フォームからID(username)とPW(password)を取得
    var username = $("#reg_username").val();
    var password = $("#IDReg_password").val();
    // loading の表示
    $.mobile.loading('show');
    // [NCMB] user インスタンスの生成
    var user = new ncmb.User();
    // [NCMB] ID / PW で新規登録
    user.set("userName", username)
        .set("password", password)
        .signUpByAccount()
        .then(function(user) {
            /* 処理成功 */
            console.log("【ID / PW 認証】新規登録に成功しました");
            // [NCMB] ID / PW でログイン
            ncmb.User.login(user)
                     .then(function(user) {
                         /* 処理成功 */
                         console.log("【ID / PW 認証】ログインに成功しました");
                         // [NCMB] ログイン中のユーザー情報の取得
                         currentLoginUser = ncmb.User.getCurrentUser();
                         var objectId = currentLoginUser.get("objectId");
                         // [NCMB] 参照権限設定(user+adminRole)
                         var acl = new ncmb.Acl();
                         acl.setReadAccess(objectId, true)
                            .setWriteAccess(objectId, true)
                            .setRoleReadAccess("admin", true)
                            .setRoleWriteAccess("admin", true);
                         // [NCMB] 更新
                         currentLoginUser.set("acl", acl)
                                         .update();    
                         // フィールドを空に
                         $("#reg_username").val("");
                         $("#IDReg_password").val("");
                         // つぶやき一覧ページへ移動
                         $.mobile.changePage('#tsubuyakiListPage');
                     })
                     .catch(function(error) {
                         /* 処理失敗 */
                         console.log("【ID / PW 認証】ログインまたは更新に失敗しました: " + error);
                         alert("【ID / PW 認証】ログインまたは更新に失敗しました: " + error);
                         // フィールドを空に
                         $("#reg_username").val("");
                         $("#IDReg_password").val("");
                         // loading の表示
                         $.mobile.loading('hide');
                     });
        })
        .catch(function(error) {
            /* 処理失敗 */
            console.log("【ID / PW 認証】新規登録に失敗しました：" + error);
            alert("【ID / PW 認証】新規登録に失敗しました：" + error);
            // フィールドを空に
            $("#reg_username").val("");
            $("#IDReg_password").val("");
            // loading の表示
            $.mobile.loading('hide');
        });
}

// 【ID / PW 認証】「ログインする」ボタン押下時の処理
function onIDLoginBtn() {
    // 入力フォームからID(username)とPW(password)を取得
    var username = $("#login_username").val();
    var password = $("#IDLogin_password").val();
    // loading の表示
    $.mobile.loading('show');

    // [NCMB] ID / PW でログイン
    ncmb.User.login(username, password)
             .then(function(user) {
                 /* 処理成功 */
                 console.log("【ID / PW 認証】ログインに成功しました");
                 // [NCMB] ログイン中のユーザー情報の取得
                 currentLoginUser = ncmb.User.getCurrentUser();
                 // フィールドを空に
                 $("#login_username").val("");
                 $("#IDLogin_password").val("");
                 // つぶやき一覧ページへ移動
                 $.mobile.changePage('#tsubuyakiListPage');
             })
             .catch(function(error) {
                 /* 処理失敗 */
                 console.log("【ID / PW 認証】ログインに失敗しました: " + error);
                 alert("【ID / PW 認証】ログインに失敗しました: " + error);
                 // フィールドを空に
                 $("#login_username").val("");
                 $("#IDLogin_password").val("");
                 // loading の表示終了
                 $.mobile.loading('hide');
             });
}

// 「ログアウト」ボタン押下後確認アラートで「はい」押下時の処理
function onLogoutBtn() {
    // [NCMB] ログアウト
    ncmb.User.logout();
    console.log("ログアウトに成功しました");
    // ログイン中のユーザー情報を空に
    currentLoginUser = null;
    // currentUserDataリストを空に
    $("#tsubuyakiList").empty();
    // 【ID / PW】ログインページへ移動
    $.mobile.changePage('#IDLoginPage');
}

/********** つぶやき管理 **********/
// つぶやきの保存
function onSendTsubuyakiBtn() {
    // loading の表示
    $.mobile.loading('show');
    // ログイン中ユーザー情報
    var objectId = currentLoginUser.get("objectId");
    var userName = currentLoginUser.get("userName");
    // つぶやきの取得
    var tsubuyakiText = $("#tsubuyakiText").val();
    // [NCMB] 保存先クラス「Tsubuyaki」の作成
    var Tsubuyaki = ncmb.DataStore("Tsubuyaki");
    // [NCMB] インスタンスの生成
    var tsubuyaki = new Tsubuyaki();
    // [NCMB] 参照権限設定(user+adminRole)
    var acl = new ncmb.Acl();
    acl.setPublicReadAccess(true)
       .setWriteAccess(objectId, true)
       .setRoleWriteAccess("admin", true);
    // [NCMB] つぶやきを保存
    tsubuyaki.set("userName", userName)
             .set("tsubuyakiText", tsubuyakiText)
             .set("acl", acl)
             .save()
             .then(function(results) {
                 // 保存成功時の処理
                 console.log("保存成功：" + JSON.stringify(results));
                 $("#tsubuyakiText").val('');
                 // つぶやき一覧ページへ移動
            　   $.mobile.changePage('#tsubuyakiListPage');
             })
             .catch(function(error) {
                 // 保存失敗時の処理
                 console.log("保存失敗" + error);
                 alert("保存失敗" + error);
                 // loading の表示終了
                 $("#tsubuyakiText").val('');
                 $.mobile.loading('hide');
             });
}

// つぶやきの取得と表示
function getTsubuyaki() {
    // loading の表示
    $.mobile.loading('show');
    // 保存先クラス「Tsubuyaki」の作成
    var Tsubuyaki = ncmb.DataStore("Tsubuyaki");
    // 保存データ全件取得
    Tsubuyaki.order("createDate", true)
           .fetchAll()
           .then(function(results){
               // 取得成功時の処理
               console.log("取得成功");
               tsubuyakiData = results;
               makeTsubuyakiList();
           })
           .catch(function(error){
               // 取得失敗時の処理
               console.log("取得失敗" + error);
               alert("取得失敗" + error);
               // loading の表示を終了
                $.mobile.loading('hide');

           });
}

// 退会ボタン押下時の処理
function onDeleteBtn() {
    // loading の表示
    $.mobile.loading('show');
    // ログイン中ユーザー情報
    var userObjectId = currentLoginUser.get("objectId");
    // 保存先クラス「Tsubuyaki」の作成
    var Tsubuyaki = ncmb.DataStore("Tsubuyaki");
    // 参照権限設定
    var acl = new ncmb.Acl();
    acl.setPublicReadAccess(true)
       .setWriteAccess(userObjectId, true)
       .setRoleWriteAccess("admin", true);
    // 退会ユーザーのつぶやきを検索
    Tsubuyaki.equalTo("acl", acl)
             .fetchAll()
             .then(function(tsubuyakiData){
                 // 検索成功時の処理
                 var count = tsubuyakiData.length;
                 console.log("検索成功：取得件数" + count + "件");
                 // 削除実行
                 if (count == 0) {
                     deleteUser(0, 0, true);
                 } else {
                     for (var i = 0; i < count; i++) {
                         var dataObjectId = tsubuyakiData[i].get("objectId");
                         // 削除
                         deleteData(dataObjectId, count, i+1);
                     } 
                 }
                 
             })
             .catch(function(error){
                 // 検索失敗時の処理
                 console.log("検索失敗" + error);
                 alert("検索失敗" + error);
                 // loading の表示を終了
                 $.mobile.loading('hide');

             });
}

function deleteData(objectId, allnumber, number) {
    // 保存先クラス「Tsubuyaki」の作成
    var Tsubuyaki = ncmb.DataStore("Tsubuyaki");
    // インスタンスの生成
    var tsubuyaki = new Tsubuyaki();
    tsubuyaki.set("objectId", objectId)
             .update()
             .then(function(tsubuyaki){
                 // つぶやきを削除
                 tsubuyaki.delete();
             })
             .then(function(result){
                 // つぶやき削除成功時の処理
                 console.log("つぶやき削除成功：" + result);
                 deleteUser(allnumber, number, true);
             })
             .catch(function(error){
                 // つぶやき削除失敗時の処理
                 console.log("つぶやき削除失敗：" + error);
                 alert("つぶやき削除失敗：" + error);
                 deleteUser(allnumber, number, false);
             });
}

function deleteUser(allnumber, number, flag) {
    if(allnumber == number) {
        if (flag) {
            // 会員の削除
             currentLoginUser.delete()
                            .then(function(result){
                                // 会員削除成功時の処理
                                console.log("会員削除成功：" + result);
                                // loading の表示を終了
                                $.mobile.loading('hide');
                                // ログイン中のユーザー情報を空に
                                currentLoginUser = null;
                                // currentUserDataリストを空に
                                $("#tsubuyakiList").empty();
                                // 【ID / PW】ログインページへ移動
                                $.mobile.changePage('#IDLoginPage');
                            })
                            .catch(function(error){
                                // 会員削除失敗時の処理
                                console.log("会員削除失敗：" + error);
                                alert("会員削除失敗：" + error);
                                // loading の表示を終了
                                $.mobile.loading('hide');
                            });
        } else {
            // retry
            onDeleteBtn();
        }
    }
}

// Navbar の設定
function setNavbar() {
    // 非表示
    $('#navBtn1').hide();
    // [NCMB] adminロール取得
    ncmb.Role.equalTo("roleName", "admin")
             .fetch()
             .then(function(role){
                 // adminロール取得成功時の処理
                 console.log("adminロール取得成功");
                 // [NCMB] adminロール内ユーザーの取得 
                 return role.fetchUser();
             })
             .then(function(users){
                 // adminロール内ユーザー取得成功時の処理
                 console.log("adminロール内ユーザー取得成功");
                 for (var i = 0; i < users.length; i++) {
                     var user = users[i];
                     if (user.userName == currentLoginUser.userName) {
                         // adminユーザーの場合
                         $('#navBtn1').show();
                     }                    
                 }
             })
             .catch(function(error){
                 // adminロールまたはadminロール内ユーザー取得失敗時の処理
                 console.log("adminロールまたはadminロール内ユーザー取得失敗：" + error);
                 alert("adminロールまたはadminロール内ユーザー取得失敗：" + error);
                 
             });
}

/********** 管理者ページ **********/
// 


//---------------------------------------------------------------------------

// アプリ起動時
$(function() {
    $.mobile.defaultPageTransition = 'none';
    /* ID / PW 認証 */
    $("#IDLoginBtn").click(onIDLoginBtn);
    $("#IDRegisterBtn").click(onIDRegisterBtn);
    $("#YesBtn_logout").click(onLogoutBtn);
    /* つぶやき */
    $("#SendTsubuyakiBtn").click(onSendTsubuyakiBtn);
    $("#reloadBtn").click(getTsubuyaki);
    $("#YesBtn_delete").click(onDeleteBtn);
});

// loading 表示生成
$(document).on('mobileinit',function(){
    $.mobile.loader.prototype.options;
});


// tsubuyakiListPage ページが表示されるたびに実行される処理
$(document).on('pageshow','#tsubuyakiListPage', function(e, d) {
    // つぶやきジリストの更新
    getTsubuyaki();
    // Navbar の設定
    setNavbar();
});

// つぶやき一覧表を作成する処理
function makeTsubuyakiList() {
    // tsubuyakiList のDOM要素を削除
    $("#tsubuyakiList").empty();
    // 一覧作成
    for (var i = 0; i < tsubuyakiData.length; i++) {
        var tsubuyaki = tsubuyakiData[i];
        console.log(i+1 + ":" + JSON.stringify(tsubuyaki));
        
        // 値を取得
        var author = tsubuyaki.get("userName");
        var tsubuyakiText = tsubuyaki.get("tsubuyakiText");
        var date = new Date(tsubuyaki.get("createDate"));
        var createDate = date.getFullYear() + "-"
                        + ((date.getMonth() < 10) ? "0" : "") + date.getMonth() + "-"
                        + ((date.getDate() < 10) ? "0" : "") + date.getDate() + " "
                        + ((date.getHours() < 10) ? "0" : "") + date.getHours() + ":"
                        + ((date.getMinutes() < 10) ? "0" : "") + date.getMinutes() + ":"
                        + ((date.getSeconds() < 10) ? "0" : "") + date.getSeconds();
        // リストに追加
        $("#tsubuyakiList").append("<li class='ui-li ui-li-static ui-btn-up-c'><p class='ui-li-aside ui-li-desc'><strong>" + createDate + "</strong></p><h3 class='ui-li-heading'>" + author + "</h3><p class='ui-li-desc'><strong></strong></p><p class='ui-li-desc'>" + tsubuyakiText + "</p></li>");

    }
    
    // loading の表示を終了
    $.mobile.loading('hide');
    
}

function onTsubuyKiDelete() {
    
}

// tsubuyakiDeletePage ページが表示されるたびに実行される処理
$(document).on('pageshow','#tsubuyakiDeletePage', function(e, d) {
    // リストの更新
    makeTsubuyakiDeleteList();
    
});


// つぶやき一覧表を作成する処理
function makeTsubuyakiDeleteList() {
    // tsubuyakiList_delete のDOM要素を削除
    $("#tsubuyakiList_delete").empty();
    // 一覧作成
    for (var i = 0; i < tsubuyakiData.length; i++) {
        var tsubuyaki = tsubuyakiData[i];
        console.log(i+1 + ":" + JSON.stringify(tsubuyaki));
        
        // 値を取得
        var objectId = tsubuyaki.get("objectId");
        var author = tsubuyaki.get("userName");
        var tsubuyakiText = tsubuyaki.get("tsubuyakiText");
        var date = new Date(tsubuyaki.get("createDate"));
        var createDate = date.getFullYear() + "-"
                        + ((date.getMonth() < 10) ? "0" : "") + date.getMonth() + "-"
                        + ((date.getDate() < 10) ? "0" : "") + date.getDate() + " "
                        + ((date.getHours() < 10) ? "0" : "") + date.getHours() + ":"
                        + ((date.getMinutes() < 10) ? "0" : "") + date.getMinutes() + ":"
                        + ((date.getSeconds() < 10) ? "0" : "") + date.getSeconds();
        // リストに追加
        $("#tsubuyakiList_delete").append("<li class='ui-li ui-li-static ui-btn-up-c'><a data-role='button' id='" + objectId + "'><p class='ui-li-aside ui-li-desc'><strong>" + createDate + "</strong></p><h3 class='ui-li-heading'>" + author + "</h3><p class='ui-li-desc'><strong></strong></p><p class='ui-li-desc'>" + tsubuyakiText + "</p></a></li>");
        $("#" + objectId).click(function(){
            var id = $(this).attr('id');
            onTsubuyKiDelete(id);
        });
    }
    
    // loading の表示を終了
    $.mobile.loading('hide');    
}

function onTsubuyKiDelete(id) {
    alert(id);
    
    // ここにデータの削除を書く
}

// userDeletePage ページが表示されるたびに実行される処理
$(document).on('pageshow','#userDeletePage', function(e, d) {
    // リストの更新
    alert("2");
});
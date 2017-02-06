(function ($) {
    var oddle = window.oddle || {};
    
    oddle.searchAutocomplete = function () {
        var searchPara = $('#search-field').val(),
            resultReturned = 5,
            apiCall = "https://api.viki.io/v4/search.json?c=" + searchPara + "&per_page=" + resultReturned + "&with_people=true&app=100266a&t=1440586215";

        if (searchPara == '') {
            $('#search-result-list').empty().hide();

        } else {
            $.getJSON(apiCall, function(data){
                //console.log(data.length);

                if (data == '') {
                    $('#search-result-list').empty().show();
                    $('#search-result-list').append('<li><strong>No Result found.</strong></li>');
                } else if (data !== '') {
                    var i;
                    $('#search-result-list').empty().show();
                    for (i = 0; i < resultReturned; i++){    
                        var template = '<li>' +
                            '<a class="clearfix" href="https://www.viki.com/' + data[i].u.w + '">' +
                            '<div class="thumbnail"><img src="' + data[i].i + '"></div>' +
                            '<div class="search-title">' + data[i].tt + '</div>' +
                            '</a></li>';

                        $('#search-result-list').append(template);
                    }

                    if (data.length > resultReturned - 1) {
                        $('#search-result-list').append('<li><a href="https://www.viki.com/search?q=' + searchPara + '">View all results</a></li>');
                    }
                }

            }).done(function() {
                // Second level success
            }).fail(function() {
                // If ajax fail                            
                console.log( "error" );
            });
        }
    };
    
    $(function() {
        // $('#search-field').keyup(oddle.searchAutocomplete);
        var searchFieldValue = $('#jsSearch').val(),
            api = "https://api.github.com/search/users?q=" + searchFieldValue;

        var app = $.sammy('#app', function() {
            this.use('Template');

            this.around(function(callback) {
                var context = this;
                
                this.load(api)
                    .then(function(items) {
                        context.items = $.parseJSON(items);
                    })
                    .then(callback);
            });

            this.get('#/', function(context) {
                context.$element().empty();

                $('#jsSearch').val("");

                // $.each(this.items, function(i, item) {
                //   context.render('templates/search.template', {id: i, item: item})
                //         .appendTo(context.$element());
                // });
                // return false;

                // var str=location.href.toLowerCase();
                // context.app.swap('');
                // context.render('templates/about.template', {})
                //      .appendTo(context.$element());
            });

            this.get('#/result/', function(context) { 
                $('#jsSearch').val("");
                context.app.swap('');
                var template = '<div class="container">' +
                                '<div class="row">' +
                                '<div class="col-xs-12">' +
                                '<ul class="c-result--list"></ul>' +
                                '</div></div></div>';

                context.$element().append(template);

                $.each(this.items.items, function(i, item) {
                    context.render('templates/search.template', {id: i, item: item, name: item.login})
                        .appendTo($('.c-result--list'));
                });

                return false;
            });

            this.get('#/user/:name/:id/', function(context) {
                $('#jsSearch').val("");
                
                this.item = this.items.items[this.params['id']];
                if (!this.item) { return this.notFound(); }

                var userDetails = 'https://api.github.com/users/' + this.params['name'],
                userRepo = 'https://api.github.com/users/' + this.params['name'] + '/repos';

                this.partial('templates/user-detail.template');

                this.load(userDetails)
                    .then(function(items) {
                        items = $.parseJSON(items);

                        var bio = '<p class="c-user--details__bio"><strong>Bio:</strong> ' + items.bio + '</p>',
                            name = '<p class="c-user--details__name"><strong>Name:</strong> ' + items.name + '</p>',
                            email = '<p class="c-user--details__email"><strong>Email:</strong> <a href="mailto: ' + items.email + '">' + items.email + '</a></p>',
                            followers = '<p class="c-user--details__bio"><strong>Followers:</strong> ' + items.followers + '</p>',
                            following = '<p class="c-user--details__bio"><strong>Following:</strong> ' + items.following + '</p>'

                        $('.c-user--details').append(name);
                        $('.c-user--details').append(email);
                        $('.c-user--details').append(bio);

                        $('.c-user--details__followers').append(followers);
                        $('.c-user--details__following').append(following);
                    });

                this.load(userRepo)
                    .then(function(items) {
                        items = $.parseJSON(items);

                        var list = '<p><strong>Repository</strong></p><ul class="c-user--repos">';

                        $.each(items, function(i, item) {
                            list +=  '<li>' + item.name + '</li>';
                        });

                        list += '</ul>';

                        $('.c-user--details').append(list);
                    });
            });

            this.before('.*', function() {
                var hash = document.location.hash;
                // $("nav").find("a").removeClass("current");
                // $("nav").find("a[href='"+hash+"']").addClass("current");
            });

        });

        $(function() {
            app.run('#/');

            $(".jsSearchBtn").click(function(){
                window.location = '#/result/';
            });
        });
    });
})(jQuery);
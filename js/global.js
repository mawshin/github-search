(function ($) {    

    $(function() {
        var api = "";
        
        var app = $.sammy('#app', function() {
            this.use('Template');

            this.get('#/', function(context) {
                context.$element().empty();

                $('#jsSearch').val("");
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
            });

        });

        app.run('#/');

        $(".jsSearchBtn").click(function(){
            api = "https://api.github.com/search/users?q=" + String($('#jsSearch').val());

            app.around(function(callback) {
                var context = this;
                
                this.load(api)
                    .then(function(items) {
                        context.items = $.parseJSON(items);
                    })
                    .then(callback);
            });

            window.location = '#/result/';
        });
    });
})(jQuery);
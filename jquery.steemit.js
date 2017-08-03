/**
 * jQuery Steemit Plugin
 * @author mkt <kontakt@markus-kottlaender.de>
 * @license MIT
 */

 (function ($) {

  $.fn.steemit = function() {
    var element = this,
        steemit = {};

    // Profile
    steemit.profile = function(options) {
      var settings = $.extend({
        user: 'mkt',
        template: '<img width="100" src="${IMAGE}" /><br><a href="https://steemit.com/@${USER}">@${USER}</a>',
        reputationPrecision: 0,
        votingPowerPrecision: 2,
        updateInterval: 10
      }, options);

      run();
      if (settings.updateInterval) {
        setInterval(run, settings.updateInterval * 1000);
      }

      function run() {
        steem.api.getAccounts([settings.user], function(err, profile) {
          if (!err && profile.length) {
            var profile = profile[0];
            var metaData = JSON.parse(profile.json_metadata).profile;

            steem.api.getFollowCount(settings.user, function(err, followers) {
              var template = steemit.getTemplate(settings.template)
                .replace(/\${USER}/gi, profile.name)
                .replace(/\${NAME}/gi, metaData.name)
                .replace(/\${LOCATION}/gi, metaData.location)
                .replace(/\${WEBSITE}/gi, metaData.website)
                .replace(/\${IMAGE}/gi, metaData.profile_image)
                .replace(/\${REPUTATION}/gi, steemit.calculateReputation(profile.reputation, settings.reputationPrecision))
                .replace(/\${VOTINGPOWER}/gi, steemit.calculateVotingPower(profile.voting_power, profile.last_vote_time, settings.votingPowerPrecision))
                .replace(/\${FOLLOWERS}/gi, followers.follower_count)
                .replace(/\${FOLLOWING}/gi, followers.following_count)
                .replace(/\${POSTCOUNT}/gi, profile.post_count)
                .replace(/\${ABOUT}/gi, metaData.about);

              element.html(template);
            });
          } else {
            element.html('Error: API not responding!');
          }
        });
      }
    };

    // Blog
    steemit.blog = function(options) {
      var settings = $.extend({
          user: "mkt",
          limit: 10,
          template: '<div><a href="${URL}">${TITLE}</a>${RESTEEMED}<br>${Payout}, ${UPVOTES} Upvotes, ${COMMENTS} Comments</div>',
          defaultImage: 'https://steemitimages.com/DQmXYX9hqSNcikTK8ARb61BPnTk4CKMhaiqr22iCKD8CKsp/steemit-logo.png',
          resteemedIndicator: ' (resteemed) ',
          payoutPrecision: 2,
          updateInterval: 10,
          dateCallback: function (date) {
              return date;
          }
      }, options);

      run();
      if (settings.updateInterval) {
        setInterval(run, settings.updateInterval * 1000);
      }

      function run() {
        steem.api.getDiscussionsByBlog({tag: settings.user, limit: settings.limit}, function(err, posts) {
          if (!err && posts.length) {
            var html = '';
            for (var i = 0; i < posts.length; i++) {
              var metaData = JSON.parse(posts[i].json_metadata);
              var template = steemit.getTemplate(settings.template)
                .replace(/\${URL}/gi, 'https://steemit.com' + posts[i].url)
                .replace(/\${TITLE}/gi, posts[i].title)
                .replace(/\${AUTHOR}/gi, posts[i].author)
                .replace(/\${RESTEEMED}/gi, posts[i].author != settings.user ? settings.resteemedIndicator : '')
                .replace(/\${RESTEEMEDBY}/gi, posts[i].first_reblogged_by ? 'resteemed by ' + posts[i].first_reblogged_by : '')
                .replace(/\${DATE}/gi, settings.dateCallback(new Date(posts[i].created)))
                .replace(/\${IMAGE}/gi, metaData.image ? metaData.image[0] : settings.defaultImage)
                .replace(/\${PAYOUT}/gi, steemit.getPayout(posts[i]).toFixed(settings.payoutPrecision))
                .replace(/\${COMMENTS}/gi, posts[i].children)
                .replace(/\${UPVOTES}/gi, posts[i].net_votes)
                .replace(/\${CATEGORY}/gi, posts[i].category);

              html += template;
            }
            element.html(html);
          } else {
            element.html('Error: API not responding!');
          }
        });
      }
    };

    // Feed
    steemit.feed = function(options) {
      var settings = $.extend({
          user: "mkt",
          limit: 10,
          template: '<div><a href="${URL}">${TITLE}</a>${RESTEEMED}<br>${Payout}, ${UPVOTES} Upvotes, ${COMMENTS} Comments</div>',
          defaultImage: 'https://steemitimages.com/DQmXYX9hqSNcikTK8ARb61BPnTk4CKMhaiqr22iCKD8CKsp/steemit-logo.png',
          resteemedIndicator: ' (resteemed) ',
          payoutPrecision: 2,
          updateInterval: 10,
          dateCallback: function (date) {
              return date;
          }
      }, options);

      run();
      if (settings.updateInterval) {
        setInterval(run, settings.updateInterval * 1000);
      }

      function run() {
        steem.api.getDiscussionsByFeed({tag: settings.user, limit: settings.limit}, function(err, posts) {
          if (!err && posts.length) {
            var html = '';
            for (var i = 0; i < posts.length; i++) {
              var metaData = JSON.parse(posts[i].json_metadata);
              var template = steemit.getTemplate(settings.template)
              .replace(/\${URL}/gi, 'https://steemit.com' + posts[i].url)
              .replace(/\${TITLE}/gi, posts[i].title)
              .replace(/\${AUTHOR}/gi, posts[i].author)
              .replace(/\${RESTEEMED}/gi, posts[i].first_reblogged_by ? settings.resteemedIndicator : '')
              .replace(/\${RESTEEMEDBY}/gi, posts[i].first_reblogged_by ? 'resteemed by ' + posts[i].first_reblogged_by : '')
              .replace(/\${DATE}/gi, settings.dateCallback(new Date(posts[i].created)))
              .replace(/\${IMAGE}/gi, metaData.image ? metaData.image[0] : settings.defaultImage)
              .replace(/\${PAYOUT}/gi, steemit.getPayout(posts[i]).toFixed(settings.payoutPrecision))
              .replace(/\${COMMENTS}/gi, posts[i].children)
              .replace(/\${UPVOTES}/gi, posts[i].net_votes)
              .replace(/\${CATEGORY}/gi, posts[i].category);

              html += template;
            }
            element.html(html);
          } else {
            element.html('Error: API not responding!');
          }
        });
      }
    };

    // New
    steemit.new = function(options) {
      var settings = $.extend({
          tag: null,
          limit: 10,
          template: '<div><a href="${URL}">${TITLE}</a><br>${Payout}, ${UPVOTES} Upvotes, ${COMMENTS} Comments</div>',
          defaultImage: 'https://steemitimages.com/DQmXYX9hqSNcikTK8ARb61BPnTk4CKMhaiqr22iCKD8CKsp/steemit-logo.png',
          payoutPrecision: 2,
          updateInterval: 10,
          dateCallback: function (date) {
              return date;
          }
      }, options);

      run();
      if (settings.updateInterval) {
        setInterval(run, settings.updateInterval * 1000);
      }

      function run() {
        steem.api.getDiscussionsByCreated({tag: settings.tag, limit: settings.limit}, function(err, posts) {
          if (!err && posts.length) {
            var html = '';
            for (var i = 0; i < posts.length; i++) {
              var metaData = JSON.parse(posts[i].json_metadata);
              var template = steemit.getTemplate(settings.template)
              .replace(/\${URL}/gi, 'https://steemit.com' + posts[i].url)
              .replace(/\${TITLE}/gi, posts[i].title)
              .replace(/\${AUTHOR}/gi, posts[i].author)
              .replace(/\${DATE}/gi, settings.dateCallback(new Date(posts[i].created)))
              .replace(/\${IMAGE}/gi, metaData.image ? metaData.image[0] : settings.defaultImage)
              .replace(/\${PAYOUT}/gi, steemit.getPayout(posts[i]).toFixed(settings.payoutPrecision))
              .replace(/\${COMMENTS}/gi, posts[i].children)
              .replace(/\${UPVOTES}/gi, posts[i].net_votes)
              .replace(/\${CATEGORY}/gi, posts[i].category);

              html += template;
            }
            element.html(html);
          } else {
            element.html('Error: API not responding!');
          }
        });
      }
    };

    // Hot
    steemit.hot = function(options) {
      var settings = $.extend({
          tag: null,
          limit: 10,
          template: '<div><a href="${URL}">${TITLE}</a><br>${Payout}, ${UPVOTES} Upvotes, ${COMMENTS} Comments</div>',
          defaultImage: 'https://steemitimages.com/DQmXYX9hqSNcikTK8ARb61BPnTk4CKMhaiqr22iCKD8CKsp/steemit-logo.png',
          payoutPrecision: 2,
          updateInterval: 10,
          dateCallback: function (date) {
              return date;
          }
      }, options);

      run();
      if (settings.updateInterval) {
        setInterval(run, settings.updateInterval * 1000);
      }

      function run() {
        steem.api.getDiscussionsByHot({tag: settings.tag, limit: settings.limit}, function(err, posts) {
          if (!err && posts.length) {
            var html = '';
            for (var i = 0; i < posts.length; i++) {
              var metaData = JSON.parse(posts[i].json_metadata);
              var template = steemit.getTemplate(settings.template)
              .replace(/\${URL}/gi, 'https://steemit.com' + posts[i].url)
              .replace(/\${TITLE}/gi, posts[i].title)
              .replace(/\${AUTHOR}/gi, posts[i].author)
              .replace(/\${DATE}/gi, settings.dateCallback(new Date(posts[i].created)))
              .replace(/\${IMAGE}/gi, metaData.image ? metaData.image[0] : settings.defaultImage)
              .replace(/\${PAYOUT}/gi, steemit.getPayout(posts[i]).toFixed(settings.payoutPrecision))
              .replace(/\${COMMENTS}/gi, posts[i].children)
              .replace(/\${UPVOTES}/gi, posts[i].net_votes)
              .replace(/\${CATEGORY}/gi, posts[i].category);

              html += template;
            }
            element.html(html);
          } else {
            element.html('Error: API not responding!');
          }
        });
      }
    };

    // Trending
    steemit.trending = function(options) {
      var settings = $.extend({
          tag: null,
          limit: 10,
          template: '<div><a href="${URL}">${TITLE}</a><br>${Payout}, ${UPVOTES} Upvotes, ${COMMENTS} Comments</div>',
          defaultImage: 'https://steemitimages.com/DQmXYX9hqSNcikTK8ARb61BPnTk4CKMhaiqr22iCKD8CKsp/steemit-logo.png',
          payoutPrecision: 2,
          updateInterval: 10,
          dateCallback: function (date) {
              return date;
          }
      }, options);

      run();
      if (settings.updateInterval) {
        setInterval(run, settings.updateInterval * 1000);
      }

      function run() {
        steem.api.getDiscussionsByTrending({tag: settings.tag, limit: settings.limit}, function(err, posts) {
          if (!err && posts.length) {
            var html = '';
            for (var i = 0; i < posts.length; i++) {
              var metaData = JSON.parse(posts[i].json_metadata);
              var template = steemit.getTemplate(settings.template)
              .replace(/\${URL}/gi, 'https://steemit.com' + posts[i].url)
              .replace(/\${TITLE}/gi, posts[i].title)
              .replace(/\${AUTHOR}/gi, posts[i].author)
              .replace(/\${DATE}/gi, settings.dateCallback(new Date(posts[i].created)))
              .replace(/\${IMAGE}/gi, metaData.image ? metaData.image[0] : settings.defaultImage)
              .replace(/\${PAYOUT}/gi, steemit.getPayout(posts[i]).toFixed(settings.payoutPrecision))
              .replace(/\${COMMENTS}/gi, posts[i].children)
              .replace(/\${UPVOTES}/gi, posts[i].net_votes)
              .replace(/\${CATEGORY}/gi, posts[i].category);

              html += template;
            }
            element.html(html);
          } else {
            element.html('Error: API not responding!');
          }
        });
      }
    };

    /**
     * Helpers
     */

    steemit.getTemplate = function(template) {
      var templateElement = document.getElementById(template);
      if (templateElement) {
        return templateElement.innerHTML;
      }

      return template;
    }

    steemit.getPayout = function(post) {
      if (post.last_payout == '1970-01-01T00:00:00') {
        var payout = post.pending_payout_value.replace(' SBD', '');
        return parseFloat(payout);
      }

      var authorPayout = post.total_payout_value.replace(' SBD', '');
      var curatorPayout = post.curator_payout_value.replace(' SBD', '');

      return parseFloat(authorPayout) + parseFloat(curatorPayout);
    }

    steemit.calculateReputation = function(rep, precision) {
      return (rep < 0 ? '-' : '') + ((((Math.log10(Math.abs(rep))) - 9) * 9) + 25).toFixed(precision);
    }

    steemit.calculateVotingPower = function(votingPower, lastVoteTime, precision) {
      var secondsPassedSinceLastVote = (new Date - new Date(lastVoteTime + "Z")) / 1000;
      votingPower += (10000 * secondsPassedSinceLastVote / 432000);

      return Math.min(votingPower / 100, 100).toFixed(precision);
    }

    return steemit;
  };

 }(jQuery));

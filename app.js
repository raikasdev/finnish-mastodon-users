// When DOM is ready
addEventListener('DOMContentLoaded', () => {

  // Update aria-busy for user-count
  const userCount = document.getElementById('user-count');
  userCount.setAttribute('aria-busy', 'true');

  // Update aria-busy for user-list
  const userList = document.getElementById('user-list');
  userList.setAttribute('aria-busy', 'true');

  // Parse CSV and add users
  fetch("following_accounts.csv")
  .then(response => response.text())
  .then(result => {
    let csv = result;
    let lines = csv.split("\n");

    lines.shift();
    document.getElementById("user-list").innerHTML = "";

    let counter = 0;
    lines.forEach((line) => {
      if (line !== "") {
        let parts = line.split(",");
        let user = parts[0];
        let acct = user.split("@")[0];
        let instance = user.split("@")[1];

        // Exceptions for vivaldi.net and testausserveri.fi
        // Add instances to array
        let instanceExceptions = [
          "vivaldi.net",
          "mastodon.ellipsis.fi",
          "mastodon.testausserveri.fi",
          "masto.henkkalaukka.fi",
        ];

        // Check if instance is in array
        if (instanceExceptions.includes(instance)) {

          // If instance is in array, change user to acct
          user = acct;

          // Exception for vivaldi.net
          if ( instance === "vivaldi.net" ) {
            instance = "social.vivaldi.net";
          }
        }

        fetch("https://"+instance+"/api/v1/accounts/lookup?acct="+user)
        .then(response => response.json())
        .then(json => {
          let display_name = json.display_name;
          let bio = json.note;
              display_name = twemoji.parse(display_name, {className: "emojione"});
              bio = twemoji.parse(bio, {className: "emojione"});

            // Init follow/profile button
            let followButton = `<a href="https://${instance}/@${user}" id="button-${json.id}" class="button button-action">Profiili</a>`;

            try {
              if (json.emojis.length > 0) {

                json.emojis.forEach(dp_emoji => {
                  display_name = display_name.replaceAll(`:${dp_emoji.shortcode}:`, `<img src="${dp_emoji.url}" alt="Emoji ${dp_emoji.shortcode}" class="emojione">`);
                    bio = bio.replaceAll(`:${dp_emoji.shortcode}:`, `<img src="${dp_emoji.url}" alt="Emoji ${dp_emoji.shortcode}" class="emojione">`);
                  });
                }
            } catch (e) {}

            // User template
            let userTemplate = `
            <li class="account-card">\
            <a class="account-card__permalink" href="https://${instance}/@${acct}" class="status__display-name" aria-label="Seuraa käyttäjää ${user}">\
              <div class="account-card__header" aria-hidden="true">\
                <img src="${json.header}" alt="Käyttäjän ${acct} header-kuva">\
              </div>\
              <div class="account-card__title">\
                <div class="account-card__title__avatar">\
                  <div class="account__avatar" style="width: 56px; height: 56px;">\
                    <img src="${json.avatar}" alt="Käyttäjän ${acct} profiilikuva">\
                  </div>
                </div>\
                <span class="display-name">\
                  <bdi>\
                    <strong class="display-name__html">${display_name}</strong>\
                  </bdi>\
                  <span class="display-name__account">${user}</span>\
                </span>\
              </div>\
            </a>\
            <div class="account-card__bio">\
              ${bio}\
            </div>\
            <div class="account-card__actions">\
              <div class="account-card__counters">\
                <div class="account-card__counters__item">\
                  <span>${json.statuses_count}</span>\
                  <small><span>Viestit</span></small>\
                </div>\
                <div class="account-card__counters__item">\
                  <span>${json.following_count}</span>\
                  <small><span>Seuraajat</span></small>\
                </div>\
                <div class="account-card__counters__item">\
                  <span>${json.followers_count}</span>\
                  <small><span>Seurataan</span></small>\
                </div>\
              </div>\
              <div class="account-card__actions__button" id="actions__button-${json.id}">\
                ${followButton}\
              </div>\
            </div>\
            <li>`;

            // Count users
            counter++;

            // Append userTemplate to user-list
            document.getElementById("user-list").innerHTML += userTemplate;

            // Update user-count
            document.getElementById("user-count").innerHTML = counter;

            // Update aria-busy for user-count
            userCount.setAttribute('aria-busy', 'false');

            // Update aria-busy for user-list
            userList.setAttribute('aria-busy', 'false');

          })
          .catch(error => {
            console.log(error);
          }
        );
      }
    });
  });
});

var oldpp = 0
var config = {}
var gainedpp = 0
const userBest = "https://osu.ppy.sh/api/get_user_best?k="
const user = "https://osu.ppy.sh/api/get_user?k="

function getKey(){
    config.key = $("#key").val()+"&u=";
}
function calculate(){
    if(parseFloat($("#input").val()) > config.scores[99]) {
        config.scores.push(parseFloat($("#input").val()));
        config.scores.sort(function (a, b) {
            if (a < b)
                return 1;
            else if (a > b)
                return -1;
            else
                return 0;
        });
        config.scores.pop();
    }
    gainedpp = (Math.round(getTotalPp()*100)/100).toFixed(2) - oldpp
    output.innerHTML = "<p>Total PP: "+(Math.round(getTotalPp()*100)/100).toFixed(2)+"pp</p>"
    output.insertAdjacentHTML("beforeend", '<p>Gained PP: '+gainedpp.toFixed(2)+'</p>');
    oldpp = (Math.round(getTotalPp()*100)/100).toFixed(2)
}

async function importUser(){
    var user = $("#user").val();
    let response = await fetch(userBest + config.key + user + "&limit=100")
        .then(async response => {
                await response.json()
                    .then(scores => {
                        console.log(scores)
                        config.bonus_pp = 0;
                        config.scores = [];
                        scores.forEach(function (score, scoreIndex) {
                            config.scores[scoreIndex] = score.pp
                        });
                    })
                    .catch(err => alert(err))
            }
        )
        .catch((err) => {return alert("Invalid API key.")})
    if(config.scores[0] == null) return alert("User is not found.")
    getBonusAndRawPP(user)
        .then(() => {
            imp.innerHTML = "<div>\n" +
                "\t\t<p>Player: <b>" + user + "</b></p>\n" +
                "\t\t<label for=\"input\"></label><textarea id=\"input\" placeholder=\"Gained raw PP\"></textarea>\n" +
                "\t\t<br>\n" +
                "\t\t<button onclick=\"calculate()\">Calculate</button>\n" +
                "\t</div>"
            output.innerHTML = "<p>Total PP: " + config.raw_pp + "pp <br> Gained PP: 0</p>"
            oldpp = config.raw_pp
        })
}

async function getBonusAndRawPP(username){
    let response = await fetch(user+config.key+username)
    await response.json()
        .then(user => {
            config.bonus_pp = parseFloat(user[0].pp_raw) - getTotalPp();
            config.raw_pp = parseFloat(user[0].pp_raw)
        })
}
function ppValue(rawPP, index) {
    return rawPP * Math.pow(0.95, index);
}

function getTotalPp() {
    console.log(config.scores)
    let pp = 0;
    config.scores.forEach(function(score, index) {
        if(index < 100)
            pp += ppValue(score, index);
    });
    pp = pp + config.bonus_pp;
    return pp;
}
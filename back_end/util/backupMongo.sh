mongoexport --db development --collection cardsettings --out data/backup/cardsettings.json
mongoexport --db development --collection usercards --out data/backup/usercards.json

echo -e '\n\n Backed Up User Cards'
cat data/backup/usercards.json
echo -e '\n\n Backed Up Card Settings'
cat data/backup/cardsettings.json

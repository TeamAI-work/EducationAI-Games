const PUZZLE = [
    // Puzzle 1: ACT (across) × ACE (down) — shared: A, C
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'act', clue: '"I am what actors do on stage!"',          icon: 'twemoji:performing-arts'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'ace', clue: '"I am the best card in the deck!"',    icon: 'twemoji:spade-suit' },
    ],
    // Puzzle 2: ADS (across) × ADO (down) — shared: A, D
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'ads', clue: '"I sell things on TV!"',          icon: 'twemoji:television'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'ado', clue: '"Much fuss about nothing!"',    icon: 'twemoji:person-shrugging' },
    ],
    // Puzzle 3: ADO (across) × ADD (down) — shared: A, D
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'ado', clue: '"Much fuss about nothing!"',          icon: 'twemoji:person-shrugging'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'add', clue: '"Put two and two together!"',    icon: 'twemoji:heavy-plus-sign' },
    ],
    // Puzzle 4: AGO (across) × AGE (down) — shared: A, G
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'ago', clue: '"I mean a long time back!"',          icon: 'twemoji:hourglass-done'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'age', clue: '"I am how many birthdays you have had!"',    icon: 'twemoji:birthday-cake' },
    ],
    // Puzzle 5: AIM (across) × AIL (down) — shared: A, I
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'aim', clue: '"Point me at the target!"',          icon: 'twemoji:direct-hit'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'ail', clue: '"I make you feel sick!"',    icon: 'twemoji:face-with-thermometer' },
    ],
    // Puzzle 6: AIR (across) × AIL (down) — shared: A, I
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'air', clue: '"I am what you breathe!"',          icon: 'twemoji:dashing-away'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'ail', clue: '"I make you feel sick!"',    icon: 'twemoji:face-with-thermometer' },
    ],
    // Puzzle 7: ALL (across) × ALE (down) — shared: A, L
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'all', clue: '"Everyone and everything!"',          icon: 'twemoji:people-holding-hands'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'ale', clue: '"I am a tasty beer!"',    icon: 'twemoji:beer-mug' },
    ],
    // Puzzle 8: ALP (across) × ALL (down) — shared: A, L
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'alp', clue: '"I am a tall snowy mountain!"',          icon: 'twemoji:snow-capped-mountain'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'all', clue: '"Everyone and everything!"',    icon: 'twemoji:people-holding-hands' },
    ],
    // Puzzle 9: ANY (across) × ANT (down) — shared: A, N
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'any', clue: '"Pick one, I do not care which!"',          icon: 'twemoji:question-mark'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'ant', clue: '"I am tiny and carry big crumbs!"',    icon: 'twemoji:ant' },
    ],
    // Puzzle 10: AND (across) × ANY (down) — shared: A, N
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'and', clue: '"I connect words together!"',          icon: 'twemoji:link'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'any', clue: '"Pick one, I do not care which!"',    icon: 'twemoji:question-mark' },
    ],
    // Puzzle 11: ASH (across) × ASP (down) — shared: A, S
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'ash', clue: '"I am what is left after a fire!"',          icon: 'twemoji:fire'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'asp', clue: '"I am a slithery Egyptian snake!"',    icon: 'twemoji:snake' },
    ],
    // Puzzle 12: ASK (across) × ASP (down) — shared: A, S
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'ask', clue: '"Raise your hand and ___ a question!"',          icon: 'twemoji:raising-hand'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'asp', clue: '"I am a slithery Egyptian snake!"',    icon: 'twemoji:snake' },
    ],
    // Puzzle 13: AWE (across) × AWL (down) — shared: A, W
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'awe', clue: '"I make your jaw drop in wonder!"',          icon: 'twemoji:star-struck'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'awl', clue: '"I am a pointy tool for leather!"',    icon: 'twemoji:hammer' },
    ],
    // Puzzle 14: BAD (across) × BAG (down) — shared: B, A
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'bad', clue: '"I am not good, I am ___!"',          icon: 'twemoji:angry-face'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'bag', clue: '"I carry your groceries home!"',    icon: 'twemoji:shopping-bags' },
    ],
    // Puzzle 15: BAR (across) × BAT (down) — shared: B, A
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'bar', clue: '"I serve yummy chocolate!"',          icon: 'twemoji:chocolate-bar'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'bat', clue: '"I fly at night and love caves!"',    icon: 'twemoji:bat' },
    ],
    // Puzzle 16: BAY (across) × BAT (down) — shared: B, A
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'bay', clue: '"I am a body of water by the land!"',          icon: 'twemoji:water-wave'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'bat', clue: '"I fly at night and love caves!"',    icon: 'twemoji:bat' },
    ],
    // Puzzle 17: BED (across) × BEE (down) — shared: B, E
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'bed', clue: '"I am cozy and you sleep in me!"',          icon: 'twemoji:bed'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'bee', clue: '"Buzz! I make honey from flowers."',    icon: 'twemoji:honeybee' },
    ],
    // Puzzle 18: BEG (across) × BET (down) — shared: B, E
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'beg', clue: '"Please, please, pretty please!"',          icon: 'twemoji:pleading-face'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'bet', clue: '"I wager five dollars you cannot!"',    icon: 'twemoji:money-bag' },
    ],
    // Puzzle 19: BIG (across) × BIN (down) — shared: B, I
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'big', clue: '"I am large and in charge!"',          icon: 'twemoji:elephant'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'bin', clue: '"Throw your trash in me!"',    icon: 'twemoji:wastebasket' },
    ],
    // Puzzle 20: BIT (across) × BIN (down) — shared: B, I
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'bit', clue: '"Just a tiny piece of something!"',          icon: 'twemoji:small-blue-diamond'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'bin', clue: '"Throw your trash in me!"',    icon: 'twemoji:wastebasket' },
    ],
    // Puzzle 21: BOB (across) × BOP (down) — shared: B, O
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'bob', clue: '"I bounce up and down in the water!"',          icon: 'twemoji:person-swimming'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'bop', clue: '"Dance and hit the beat!"',    icon: 'twemoji:musical-notes' },
    ],
    // Puzzle 22: BOT (across) × BOW (down) — shared: B, O
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'bot', clue: '"I am a robot on the internet!"',          icon: 'twemoji:robot'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'bow', clue: '"I am a pretty ribbon knot!"',    icon: 'twemoji:ribbon' },
    ],
    // Puzzle 23: BOY (across) × BOX (down) — shared: B, O
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'boy', clue: '"I am a young man!"',          icon: 'twemoji:boy'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'box', clue: '"Put your toys inside me!"',    icon: 'twemoji:package' },
    ],
    // Puzzle 24: BUG (across) × BUN (down) — shared: B, U
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'bug', clue: '"I am a tiny creepy crawly!"',          icon: 'twemoji:bug'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'bun', clue: '"I am a soft roll for your hot dog!"',    icon: 'twemoji:bread' },
    ],
    // Puzzle 25: BUS (across) × BUT (down) — shared: B, U
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'bus', clue: '"Hop on! I take kids to school."',          icon: 'twemoji:bus'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'but', clue: '"I connect two different ideas!"',    icon: 'twemoji:left-right-arrow' },
    ],
    // Puzzle 26: BUY (across) × BUT (down) — shared: B, U
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'buy', clue: '"Trade money for toys!"',          icon: 'twemoji:shopping-cart'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'but', clue: '"I connect two different ideas!"',    icon: 'twemoji:left-right-arrow' },
    ],
    // Puzzle 27: CAB (across) × CAD (down) — shared: C, A
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'cab', clue: '"I am a taxi you hail on the street!"',          icon: 'twemoji:taxi'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'cad', clue: '"I am a rude and dishonest man!"',    icon: 'twemoji:man-gesturing-no' },
    ],
    // Puzzle 28: CAP (across) × CAR (down) — shared: C, A
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'cap', clue: '"I sit on top of your head!"',          icon: 'twemoji:billed-cap'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'car', clue: '"Vroom! I have four wheels."',    icon: 'twemoji:automobile' },
    ],
    // Puzzle 29: CAT (across) × CAR (down) — shared: C, A
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'cat', clue: '"Meow! I like to nap."',          icon: 'twemoji:cat'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'car', clue: '"Vroom! I have four wheels."',    icon: 'twemoji:automobile' },
    ],
    // Puzzle 30: CAW (across) × CAR (down) — shared: C, A
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'caw', clue: '"Caw! I am a noisy crow!"',          icon: 'twemoji:crow'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'car', clue: '"Vroom! I have four wheels."',    icon: 'twemoji:automobile' },
    ],
    // Puzzle 31: COB (across) × COD (down) — shared: C, O
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'cob', clue: '"I am the middle of a corn ear!"',          icon: 'twemoji:ear-of-corn'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'cod', clue: '"I am a fish and chips fish!"',    icon: 'twemoji:fish' },
    ],
    // Puzzle 32: COT (across) × COW (down) — shared: C, O
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'cot', clue: '"I am a small bed for camping!"',          icon: 'twemoji:tent'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'cow', clue: '"Moo! I give you milk!"',    icon: 'twemoji:cow' },
    ],
    // Puzzle 33: COX (across) × COY (down) — shared: C, O
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'cox', clue: '"I steer the rowing boat!"',          icon: 'twemoji:rowboat'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'coy', clue: '"I am shy and playfully modest!"',    icon: 'twemoji:face-with-hand-over-mouth' },
    ],
    // Puzzle 34: CUB (across) × CUD (down) — shared: C, U
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'cub', clue: '"I am a baby bear!"',          icon: 'twemoji:bear'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'cud', clue: '"Cows chew me over and over!"',    icon: 'twemoji:cow-face' },
    ],
    // Puzzle 35: CUP (across) × CUD (down) — shared: C, U
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'cup', clue: '"Sip your juice from me!"',          icon: 'twemoji:cup-with-straw'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'cud', clue: '"Cows chew me over and over!"',    icon: 'twemoji:cow-face' },
    ],
    // Puzzle 36: CUT (across) × CUD (down) — shared: C, U
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'cut', clue: '"Scissors do this to paper."',          icon: 'twemoji:scissors'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'cud', clue: '"Cows chew me over and over!"',    icon: 'twemoji:cow-face' },
    ],
    // Puzzle 37: DAD (across) × DAM (down) — shared: D, A
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'dad', clue: '"I am your father!"',          icon: 'twemoji:man'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'dam', clue: '"I block a river to make a lake!"',    icon: 'twemoji:bridge-at-night' },
    ],
    // Puzzle 38: DAY (across) × DAM (down) — shared: D, A
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'day', clue: '"The sun is up and it is bright!"',          icon: 'twemoji:sun'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'dam', clue: '"I block a river to make a lake!"',    icon: 'twemoji:bridge-at-night' },
    ],
    // Puzzle 39: DEN (across) × DEW (down) — shared: D, E
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'den', clue: '"I am a cozy room for reading!"',          icon: 'twemoji:books'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'dew', clue: '"I am water drops on morning grass!"',    icon: 'twemoji:droplet' },
    ],
    // Puzzle 40: DIG (across) × DIM (down) — shared: D, I
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'dig', clue: '"Use a shovel to make a hole!"',          icon: 'twemoji:pick'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'dim', clue: '"Turn down the lights, it is too bright!"',    icon: 'twemoji:dim-button' },
    ],
    // Puzzle 41: DIN (across) × DIM (down) — shared: D, I
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'din', clue: '"I am a very loud noise!"',          icon: 'twemoji:loud-speaker'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'dim', clue: '"Turn down the lights, it is too bright!"',    icon: 'twemoji:dim-button' },
    ],
    // Puzzle 42: DIP (across) × DIM (down) — shared: D, I
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'dip', clue: '"Dunk your chip in salsa!"',          icon: 'twemoji:pot-of-food'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'dim', clue: '"Turn down the lights, it is too bright!"',    icon: 'twemoji:dim-button' },
    ],
    // Puzzle 43: DOG (across) × DOT (down) — shared: D, O
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'dog', clue: '"Woof! I wag my tail."',          icon: 'twemoji:dog'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'dot', clue: '"I am a tiny round spot!"',    icon: 'twemoji:large-blue-circle' },
    ],
    // Puzzle 44: DRY (across) × DOT (down) — shared: D, O
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'dry', clue: '"I am not wet anymore!"',          icon: 'twemoji:sun-behind-cloud'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'dot', clue: '"I am a tiny round spot!"',    icon: 'twemoji:large-blue-circle' },
    ],
    // Puzzle 45: DUD (across) × DUE (down) — shared: D, U
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'dud', clue: '"I am a firework that did not go boom!"',          icon: 'twemoji:firecracker'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'due', clue: '"Your homework is ___ tomorrow!"',    icon: 'twemoji:calendar' },
    ],
    // Puzzle 46: DUG (across) × DUE (down) — shared: D, U
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'dug', clue: '"I already dug the hole!"',          icon: 'twemoji:hole'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'due', clue: '"Your homework is ___ tomorrow!"',    icon: 'twemoji:calendar' },
    ],
    // Puzzle 47: DUN (across) × DUE (down) — shared: D, U
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'dun', clue: '"I am a grayish brown color!"',          icon: 'twemoji:brown-circle'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'due', clue: '"Your homework is ___ tomorrow!"',    icon: 'twemoji:calendar' },
    ],
    // Puzzle 48: DUO (across) × DUE (down) — shared: D, U
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'duo', clue: '"We are a pair, just two of us!"',          icon: 'twemoji:two-men-holding-hands'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'due', clue: '"Your homework is ___ tomorrow!"',    icon: 'twemoji:calendar' },
    ],
    // Puzzle 49: EAR (across) × EAT (down) — shared: E, A
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'ear', clue: '"I hear sounds on the side of your head!"',          icon: 'twemoji:ear'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'eat', clue: '"Open wide and chew your food!"',    icon: 'twemoji:spoon' },
    ],
    // Puzzle 50: EGG (across) × EGO (down) — shared: E, G
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'egg', clue: '"I am oval and come from a chicken!"',          icon: 'twemoji:egg'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'ego', clue: '"I am how much you think of yourself!"',    icon: 'twemoji:mirror' },
    ],
    // Puzzle 51: ELF (across) × ELK (down) — shared: E, L
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'elf', clue: '"I am a tiny helper at the North Pole!"',          icon: 'twemoji:elf'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'elk', clue: '"I am a big deer with antlers!"',    icon: 'twemoji:deer' },
    ],
    // Puzzle 52: ELM (across) × ELK (down) — shared: E, L
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'elm', clue: '"I am a tall shady tree!"',          icon: 'twemoji:deciduous-tree'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'elk', clue: '"I am a big deer with antlers!"',    icon: 'twemoji:deer' },
    ],
    // Puzzle 53: EMU (across) × END (down) — shared: E, M/E, N
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'emu', clue: '"I am a big bird that cannot fly!"',          icon: 'twemoji:bird'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'end', clue: '"I am the finish line!"',    icon: 'twemoji:checkered-flag' },
    ],
    // Puzzle 54: ERA (across) × ERE (down) — shared: E, R
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'era', clue: '"I am a long period of history!"',          icon: 'twemoji:scroll'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'ere', clue: '"Before, in old-timey talk!"',    icon: 'twemoji:old-man' },
    ],
    // Puzzle 55: EVE (across) × EWE (down) — shared: E, W/E, V
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'eve', clue: '"I am the night before a holiday!"',          icon: 'twemoji:christmas-tree'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'ewe', clue: '"I am a mama sheep!"',    icon: 'twemoji:sheep' },
    ],
    // Puzzle 56: FAN (across) × FAR (down) — shared: F, A
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'fan', clue: '"I blow cool air and spin around!"',          icon: 'twemoji:electric-plug'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'far', clue: '"I am a long, long way away!"',    icon: 'twemoji:world-map' },
    ],
    // Puzzle 57: FAT (across) × FAR (down) — shared: F, A
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'fat', clue: '"I am extra squishy on your belly!"',          icon: 'twemoji:potato'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'far', clue: '"I am a long, long way away!"',    icon: 'twemoji:world-map' },
    ],
    // Puzzle 58: FAX (across) × FAR (down) — shared: F, A
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'fax', clue: '"I send paper messages over phone lines!"',          icon: 'twemoji:printer'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'far', clue: '"I am a long, long way away!"',    icon: 'twemoji:world-map' },
    ],
    // Puzzle 59: FED (across) × FEE (down) — shared: F, E
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'fed', clue: '"I already ate, I am full!"',          icon: 'twemoji:baby-bottle'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'fee', clue: '"You pay me to enter the park!"',    icon: 'twemoji:money-bag' },
    ],
    // Puzzle 60: FEN (across) × FEE (down) — shared: F, E
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'fen', clue: '"I am a marshy wetland!"',          icon: 'twemoji:swamp'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'fee', clue: '"You pay me to enter the park!"',    icon: 'twemoji:money-bag' },
    ],
    // Puzzle 61: FEW (across) × FEE (down) — shared: F, E
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'few', clue: '"Not many, just a small handful!"',          icon: 'twemoji:small-orange-diamond'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'fee', clue: '"You pay me to enter the park!"',    icon: 'twemoji:money-bag' },
    ],
    // Puzzle 62: FEY (across) × FEE (down) — shared: F, E
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'fey', clue: '"I am magical and otherworldly!"',          icon: 'twemoji:sparkles'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'fee', clue: '"You pay me to enter the park!"',    icon: 'twemoji:money-bag' },
    ],
    // Puzzle 63: FIG (across) × FIN (down) — shared: F, I
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'fig', clue: '"I am a sweet purple fruit!"',          icon: 'twemoji:grapes'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'fin', clue: '"I help fish swim through water!"',    icon: 'twemoji:fish' },
    ],
    // Puzzle 64: FIR (across) × FIN (down) — shared: F, I
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'fir', clue: '"I am a Christmas tree that stays green!"',          icon: 'twemoji:christmas-tree'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'fin', clue: '"I help fish swim through water!"',    icon: 'twemoji:fish' },
    ],
    // Puzzle 65: FIT (across) × FIN (down) — shared: F, I
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'fit', clue: '"I am just the right size!"',          icon: 'twemoji:ok-hand'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'fin', clue: '"I help fish swim through water!"',    icon: 'twemoji:fish' },
    ],
    // Puzzle 66: FIX (across) × FIN (down) — shared: F, I
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'fix', clue: '"I repair what is broken!"',          icon: 'twemoji:hammer-and-wrench'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'fin', clue: '"I help fish swim through water!"',    icon: 'twemoji:fish' },
    ],
    // Puzzle 67: FOB (across) × FOG (down) — shared: F, O
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'fob', clue: '"I am a chain for your pocket watch!"',          icon: 'twemoji:watch'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'fog', clue: '"I am thick mist that hides the road!"',    icon: 'twemoji:fog' },
    ],
    // Puzzle 68: FOP (across) × FOG (down) — shared: F, O
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'fop', clue: '"I am a fancy dressed-up man!"',          icon: 'twemoji:tuxedo'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'fog', clue: '"I am thick mist that hides the road!"',    icon: 'twemoji:fog' },
    ],
    // Puzzle 69: FOR (across) × FOG (down) — shared: F, O
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'for', clue: '"This gift is ___ you!"',          icon: 'twemoji:wrapped-gift'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'fog', clue: '"I am thick mist that hides the road!"',    icon: 'twemoji:fog' },
    ],
    // Puzzle 70: FOX (across) × FOG (down) — shared: F, O
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'fox', clue: '"I am clever and have a bushy tail."',          icon: 'twemoji:fox'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'fog', clue: '"I am thick mist that hides the road!"',    icon: 'twemoji:fog' },
    ],
    // Puzzle 71: FUN (across) × FUR (down) — shared: F, U
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'fun', clue: '"I am a good time with friends!"',          icon: 'twemoji:party-popper'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'fur', clue: '"I am soft hair on animals!"',    icon: 'twemoji:rabbit' },
    ],
    // Puzzle 72: GAB (across) × GAD (down) — shared: G, A
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'gab', clue: '"I talk and talk and talk some more!"',          icon: 'twemoji:speech-balloon'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'gad', clue: '"I wander around just for fun!"',    icon: 'twemoji:person-walking' },
    ],
    // Puzzle 73: GAG (across) × GAD (down) — shared: G, A
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'gag', clue: '"I make you laugh with a funny joke!"',          icon: 'twemoji:face-with-tears-of-joy'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'gad', clue: '"I wander around just for fun!"',    icon: 'twemoji:person-walking' },
    ],
    // Puzzle 74: GAL (across) × GAD (down) — shared: G, A
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'gal', clue: '"I am a girl or young woman!"',          icon: 'twemoji:woman'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'gad', clue: '"I wander around just for fun!"',    icon: 'twemoji:person-walking' },
    ],
    // Puzzle 75: GAP (across) × GAD (down) — shared: G, A
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'gap', clue: '"I am a space between two things!"',          icon: 'twemoji:hole'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'gad', clue: '"I wander around just for fun!"',    icon: 'twemoji:person-walking' },
    ],
    // Puzzle 76: GAS (across) × GAD (down) — shared: G, A
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'gas', clue: '"I fuel up your family car!"',          icon: 'twemoji:fuel-pump'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'gad', clue: '"I wander around just for fun!"',    icon: 'twemoji:person-walking' },
    ],
    // Puzzle 77: GAY (across) × GAD (down) — shared: G, A
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'gay', clue: '"I am happy and full of joy!"',          icon: 'twemoji:rainbow'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'gad', clue: '"I wander around just for fun!"',    icon: 'twemoji:person-walking' },
    ],
    // Puzzle 78: GEM (across) × GET (down) — shared: G, E
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'gem', clue: '"I am a shiny precious stone!"',          icon: 'twemoji:gem-stone'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'get', clue: '"Go ___ your jacket, it is cold!"',    icon: 'twemoji:coat' },
    ],
    // Puzzle 79: GIB (across) × GIG (down) — shared: G, I
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'gib', clue: '"I am a fast cat, a ___ cat!"',          icon: 'twemoji:cat2'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'gig', clue: '"I am a musician\'s concert job!"',    icon: 'twemoji:microphone' },
    ],
    // Puzzle 80: GIN (across) × GIG (down) — shared: G, I
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'gin', clue: '"I am a clear strong drink!"',          icon: 'twemoji:tropical-drink'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'gig', clue: '"I am a musician\'s concert job!"',    icon: 'twemoji:microphone' },
    ],
    // Puzzle 81: GIT (across) × GIG (down) — shared: G, I
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'git', clue: '"I am a silly person, you ___!"',          icon: 'twemoji:clown-face'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'gig', clue: '"I am a musician\'s concert job!"',    icon: 'twemoji:microphone' },
    ],
    // Puzzle 82: GOB (across) × GOD (down) — shared: G, O
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'gob', clue: '"I am a lump of something yucky!"',          icon: 'twemoji:face-vomiting'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'god', clue: '"I am worshipped and very powerful!"',    icon: 'twemoji:church' },
    ],
    // Puzzle 83: GOT (across) × GOD (down) — shared: G, O
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'got', clue: '"I already have it!"',          icon: 'twemoji:shopping-bags'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'god', clue: '"I am worshipped and very powerful!"',    icon: 'twemoji:church' },
    ],
    // Puzzle 84: GOO (across) × GOD (down) — shared: G, O
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'goo', clue: '"I am sticky and slimy and icky!"',          icon: 'twemoji:slime'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'god', clue: '"I am worshipped and very powerful!"',    icon: 'twemoji:church' },
    ],
    // Puzzle 85: GUM (across) × GUN (down) — shared: G, U
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'gum', clue: '"I am chewy candy you blow bubbles with!"',          icon: 'twemoji:candy'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'gun', clue: '"I go bang and shoot things far!"',    icon: 'twemoji:pistol' },
    ],
    // Puzzle 86: GUT (across) × GUN (down) — shared: G, U
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'gut', clue: '"I am your tummy inside!"',          icon: 'twemoji:stomach'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'gun', clue: '"I go bang and shoot things far!"',    icon: 'twemoji:pistol' },
    ],
    // Puzzle 87: GUY (across) × GUN (down) — shared: G, U
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'guy', clue: '"I am just some dude!"',          icon: 'twemoji:man'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'gun', clue: '"I go bang and shoot things far!"',    icon: 'twemoji:pistol' },
    ],
    // Puzzle 88: HAD (across) × HAG (down) — shared: H, A
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'had', clue: '"I already owned it before!"',          icon: 'twemoji:memo'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'hag', clue: '"I am a mean old witch!"',    icon: 'twemoji:woman-mage' },
    ],
    // Puzzle 89: HAM (across) × HAG (down) — shared: H, A
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'ham', clue: '"I am yummy pink meat from a pig!"',          icon: 'twemoji:cut-of-meat'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'hag', clue: '"I am a mean old witch!"',    icon: 'twemoji:woman-mage' },
    ],
    // Puzzle 90: HAS (across) × HAG (down) — shared: H, A
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'has', clue: '"She ___ a pretty red balloon!"',          icon: 'twemoji:balloon'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'hag', clue: '"I am a mean old witch!"',    icon: 'twemoji:woman-mage' },
    ],
    // Puzzle 91: HAT (across) × HAG (down) — shared: H, A
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'hat', clue: '"I sit on top of your head."',          icon: 'twemoji:billed-cap'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'hag', clue: '"I am a mean old witch!"',    icon: 'twemoji:woman-mage' },
    ],
    // Puzzle 92: HAY (across) × HAG (down) — shared: H, A
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'hay', clue: '"I am dried grass for horses to eat!"',          icon: 'twemoji:sheaf-of-rice'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'hag', clue: '"I am a mean old witch!"',    icon: 'twemoji:woman-mage' },
    ],
    // Puzzle 93: HEM (across) × HEN (down) — shared: H, E
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'hem', clue: '"I am the folded edge of your pants!"',          icon: 'twemoji:sewing-needle'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'hen', clue: '"Cluck! I lay eggs on the farm."',    icon: 'twemoji:chicken' },
    ],
    // Puzzle 94: HEP (across) × HEN (down) — shared: H, E
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'hep', clue: '"I am cool and in the know!"',          icon: 'twemoji:sunglasses'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'hen', clue: '"Cluck! I lay eggs on the farm."',    icon: 'twemoji:chicken' },
    ],
    // Puzzle 95: HER (across) × HEN (down) — shared: H, E
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'her', clue: '"She is the girl, give it to ___!"',          icon: 'twemoji:woman'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'hen', clue: '"Cluck! I lay eggs on the farm."',    icon: 'twemoji:chicken' },
    ],
    // Puzzle 96: HEW (across) × HEN (down) — shared: H, E
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'hew', clue: '"I chop wood with an axe!"',          icon: 'twemoji:axe'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'hen', clue: '"Cluck! I lay eggs on the farm."',    icon: 'twemoji:chicken' },
    ],
    // Puzzle 97: HEX (across) × HEN (down) — shared: H, E
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'hex', clue: '"I am a magic spell or curse!"',          icon: 'twemoji:crystal-ball'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'hen', clue: '"Cluck! I lay eggs on the farm."',    icon: 'twemoji:chicken' },
    ],
    // Puzzle 98: HEY (across) × HEN (down) — shared: H, E
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'hey', clue: '"___ there! Hello to you!"',          icon: 'twemoji:waving-hand'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'hen', clue: '"Cluck! I lay eggs on the farm."',    icon: 'twemoji:chicken' },
    ],
    // Puzzle 99: HID (across) × HIM (down) — shared: H, I
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'hid', clue: '"I found a secret place to hide!"',          icon: 'twemoji:see-no-evil-monkey'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'him', clue: '"He is the boy, give it to ___!"',    icon: 'twemoji:man' },
    ],
    // Puzzle 100: HIP (across) × HIM (down) — shared: H, I
    [
        { id: 1, label: '1 ACROSS', direction: 'across', answer: 'hip', clue: '"I am the side of your body that wiggles!"',          icon: 'twemoji:dancer'        },
        { id: 2, label: '2 DOWN',   direction: 'down',   answer: 'him', clue: '"He is the boy, give it to ___!"',    icon: 'twemoji:man' },
    ],
];

export default PUZZLE;
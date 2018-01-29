## Assassin

The night has fallen, and the time has come to assassinate the evil citizens!
**Whom shall you eliminate?**
```
!assassinate \<player>

Are you sure you want to assassinate @\<player2>? Please type `%confirm` to confirm your choice!

Your request has been sent to the @Game Masters!

The Assassin @\<player1> has sent a request to Assassinate @\<player2>!
Please type the following in this chat to confirm;

!humankill @\<IDplayer2>
```
> This command should turn the player into an undead if demonized, and kill them if not demonized.


---

## Barber
```
!barberkill \<player>

Are you sure you want to assassinate @\<player2>? Please type `%confirm` to confirm your choice!

Your request has been sent to the @Game Masters!

The Barber @\<player1> has sent a request to Assassinate @\<player2>!
Please type the following in this chat to confirm;

%lynch @\<IDplayer2>

```
> This command should kill the player.


---



## Crowd Seeker
The night has come, and it is time for you to look through the crowd for the right roles...
**Whom shall you inspect tonight?**

```
%seek \<player2> \<role>

Are you sure you want to check \<player2> as the \<role>? Please type %confirm to confirm.

Your request has been sent to the @Game Masters!

The Crowd Seeker @\<player1> would like to inspect \<player2> as the \<role>!
Please type the following in this chat to confirm;

%check @\<Channelplayer1> @\<player2> @\<role>
```

> This command should check the truthteller's role of a player for the crowd seeker.


---

## Cupid
The cupid can choose one player to fall in love with. They can no longer vote to kill each other, and they will die if the other player dies. If both players are on different teams, the couple can only win if all their enemies are dead.

---

## Dog

```
%dogchange innocent
%dogchange cursed
%dogchange wolf

Are you sure you want to continue playing this game as \<role>? Please type `%confirm` to confirm your choice!

Your request has been sent to the @Game Masters!

The Dog @\<player1> has chosen to play the game as \<role>!
Please type the following in this chat to confirm;

%set role @\<player1> Innocent
%set role @\<player1> Cursed Civilian
%set role @\<player1> Werewolf
```

> This command is being used on the first night, to let the Dog choose a role.



---

## Exorcist

```
%undoom @\<player2>

Are you sure you want to undoom @\<player2>? Please type `%confirm` to confirm your choice!

Your request has been sent to the @Game Masters!

The Exorcist @\<player1> has chosen to undoom @\<player2>!!
Please type the following in this chat to confirm;

%exorcise \<IDchannelplayer1> @\<player2>

```

######  If @\<player2> is a Vampire, Undead or The Thing;
>Congratulations! @\<player2> had the role of `Vampire/Undead/The Thing`, which means that you have successfully >eliminated them!(Even better, their powers of `The Thing` won't trigger, so they will be dead immediately!)


###### If not:
>Unfortunately, @\<player2> wasn't a `Vampire`, an `Undead` or `The Thing`. They will not be eliminated.


---

## Fortune Teller
```
%inspectF @\<player2>

Are you sure you want to inspect @\<player2>? Please type `%confirm` to confirm your choice!

The fortune teller @\<player1> would like to inspect @\<player2>!
Please type the following in this chat to confirm;

%foresee \<IDchannelplayer1> @\<player2>
```
##### If enchanted by the flute player
```
The fortune teller @\<player1> would like to inspect @\<player2>! However, they have been enchanted by the flute player, and there is at least one flute player alive!'
Please type the following in this chat to confirm;

%enchantforesee \<IDchannelplayer1> @\<player2>```

> This command has a 40% chance to do the same as the %foresee-command, and a 60% chance to show that the player is a Flute Player.



---

## Hooker
Each night, the hooker sleeps with another player. That means that if people attempt to kill the hooker, they cannot be found, since they're not at home. However, if the player they're sleeping with is being attacked, then so is the hooker.

---

## Look-Alike

```
%copycat @\<player2>

Are you sure you want to become a look-alike of @\<player2>? You will copy all their data, including whether they're demonized, enchanted, etc.
Please type `%confirm` to confirm your choice!

Your request has been sent to the @Game Masters!

The Look-Alike @\<player1> would like to become like @\<player2>!
Please type the following in this chat to confirm;

%copydata @\<player2> @\<player1>
```
>Note the order; FROM the target TO the look-alike.

---

## Priestess
```
%purify @\<player2>

I am sorry, but @\<player2> isn't participating this game.

@\<player2> is dead. It's too late to purify dead players. Choose another player!

You can't purify yourself. There's no need to, you're

Are you sure you want to purify @\<player2>? Please type `%confirm` to confirm your choice!

Your request has been sent to the @Game Masters!

The Priestess has chosen to purify @\<player2>, who has the role of the `\<role_player2>`!
Please type the following in this chat to confirm;

%innocentify \<IDchannelplayer1> @\<player2>
```

---


## Raven
```
%threaten @\<player2>

I am sorry, but @\<player2> isn't participating this game.

@\<player2> is dead. The dead aren't afraid of your threats, use your powers on the living.

Wait, you want to threaten yourself? ...hrm, well, technically, it's not illegal, but I wouldn't recommend it.
If you are very certain of it, type `%confirm` to confirm your choice.

Are you sure you want to threaten @\<player2>? Please type `%confirm` to confirm your choice!

Your request has been sent to the @Game Masters!

The Raven @\<player1> would like to threaten @\<player2>!
Please type the following in this chat to confirm;

%ravenattack @\<player2>
```
---


## Royal Knight
```
%forgive

Are you sure you want to forgive whoever is going to be lynched? This will cancel the lynch for today!
Please type `%confirm` to confirm your choice!

Your request has been sent to the @Game Masters!

**BREAKING NEWS:** The Royal Knight @\<player1> would like to cancel today's lynch! Please type the following command to confirm;

%cancellynch @\<player1>
```
---

# WEREWOLVES

## Curse Caster
```
%curse @\<player2>

I am sorry, but @\<player2> isn't participating this game.

@\<player2> is dead. You can't curse them.

Are you sure you want to curse @\<player2>? Please type `%confirm` to confirm your choice!

Your request has been sent to the @Game Masters!

The Curse Caster @\<player1> would like to curse @\<player2>!
Please type the following in this chat to confirm;

%castcurse \<IDchannelplayer1> @\<player2>
```
```
Your curses' results were `negative`. @\<player2> wasn't innocent, so they couldn't be cursed!
Your curses' results were `neutral`. @\<player2> couldn't be cursed since they were already a `Cursed Civilian`!
Your curses' results were `positive`. @\<player2> is now a `Cursed Civilian`!```



---


## Infected Wolf

```
%infect @\<player2>

I am sorry, but @\<player2> isn't participating this game.

@\<player2> is dead. You can't bring the dead back to life, I'm sorry.

You can't infect yourself. Technically, you already _are_ infected!

Are you sure you want to change @\<player2> into a Werewolf? Please type `%confirm` to confirm you choice!

Your request has been sent to the @Game Masters!

The Infected Wolf would like to infect @\<player2>!
Please type the following in this chat to confirm;

%wolfinfect @\<player2>```

---

## Tanner
```
%disguise @\<player2> \<role>

I am sorry, but @\<player2> isn't participating this game.

@\<player2> is dead. No need to disguise the dead.

Are you sure you want to disguise @\<player2> as a \<role>? Please type `%confirm` to confirm your choice!

Your request has been sent to the @Game Masters!

The tanner @\<player1> would like to disguise @\<player2> as \<role>.
Please type the following in this chat to confirm;

%tannerdisguise \<IDchannelplayer1> @\<player2> \<role>

@\<player2> has been successfully disguised by the @Game Masters!
```

## Warlock
```
%inspectW @\<player2>

I am sorry, but @\<player2> isn't participating this game.

@\<player2> is dead. You can't inspect dead players.

Are you sure you want to inspect @\<player2>? Please type %confirm to confirm your choice!

The Warlock @\<player1> would like to inspect @\<player2>!
Please type the following in this chat to confirm;

%foresee \<IDchannelplayer1> @\<player2>```

###### If enchanted by the flute player

>The Warlock @\<player1> would like to inspect @\<player2>! However, they have been enchanted by the flute player, and there is at least one flute player alive!'
Please type the following in this chat to confirm; ``%enchantforesee \<IDchannelplayer1> @\<player2>`

##### else
>This command has a 40% chance to do the same as the %foresee-command, and a 60% chance to show that the player is a Flute Player.



----

# SOLO PLAYERS

## Flute Player
```
%enchant @\<player2>

I am sorry, but @\<player2> isn't participating this game.

@\<player2> is dead. You don't have to enchant the dead players anymore.

Sorry, you can't enchant yourself. Choose another player!

@\<player2> is a Flute Player. You don't need to enchant them!

@\<player2> has already been enchanted!

Are you sure you want to enchant @\<player2>, and make them one of your flute victims? Please type `%confirm` to confirm.

The Flute Player @\<player1> would like to enchant @\<player2>!
Please type the following in this chat to confirm;

%flute @\<player2>
```

---




## Vampire

%vampbite @\<player2>

I am sorry, but @\<player2> isn't participating this game.

@\<player2> is dead. You can't bite a dead player.

Sorry, you can't bite yourself. Choose another victim!

@\<player2> is already undead. No need to bite them again!

@\<player2> has already been bitten before. You'll need a victim with some more blood!

Are you sure you want to drink the blood of @\<player2> tonight? Please type `%confirm` to confirm.

Your request has been sent to the @Game Masters!

The Vampire @\<player1> would like to demonize @\<player2>!
Please type the following in this chat to confirm;

```%demonize @\<player2>```

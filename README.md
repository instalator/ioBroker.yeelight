![Logo](admin/yeelight.png)
# ioBroker xiaomi yeelight adapter
=================

[![NPM version](http://img.shields.io/npm/v/iobroker.yeelight.svg)](https://www.npmjs.com/package/iobroker.yeelight)
[![Downloads](https://img.shields.io/npm/dm/iobroker.yeelight.svg)](https://www.npmjs.com/package/iobroker.yeelight)
[![Tests](http://img.shields.io/travis/instalator/ioBroker.yeelight/master.svg)](https://travis-ci.org/instalator/ioBroker.yeelight)

[![NPM](https://nodei.co/npm/iobroker.yeelight.png?downloads=true)](https://nodei.co/npm/iobroker.yeelight/)

## Описание
RU
Это драйвер для работы ламп и светильников Yeelight в открытой системе автоматизации ioBroker https://github.com/ioBroker/ioBroker
Драйвер работает со всеми лампами и светильниками Yeelight управляемыми по wifi сети и поддерживающими открытый API производителя.
Для работы драйвера не нужно подключение к сети Интернет и облаку производителя достаточно подключения по локальной сети.

Поддерживаются лампы и светильники:

ТУТ ДОЛЖЕН БЫТЬ СПИСОК ЛАМП НЕ ЗАКОНЧЕНО
Yeelight LED Bulb (White)
Yeelight LED Bulb (Color) 
Yeelight LED Ceiling Light YLXD01YL
Yeelight Bedside Lamp wifi
Yeelight Lightstrip (Color)

Для подключения к драйверу необходимо перевести светильники Yeelight в режим разработчика (LAN CONTROL DEVELOPER MODE)  https://www.yeelight.com/en_US/developer  . Это делается через приложение для смартфона Yeelight https://play.google.com/store/apps/details?id=com.yeelight.cherry .

У драйвера нет настроек. В результате установки драйвера в объектах ioBroker появляются все светильники Yeelight находящиеся в локальной сети.


## Changelog

### 0.0.2 (2018-05-28)
* (instalator) initial

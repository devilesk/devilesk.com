var getJSON = require('./util/getJSON');
    
var KTLIB = (function () {
  
  var attributeOptions = [
    {id: "armorphysical", name: "Armor"},
    {id: "projectilespeed", name: "Missile Speed"},
    {id: "attackrange", name: "Attack Range"},
    {id: "attributeagilitygain", name: "Agi Gain"},
    {id: "attributestrengthgain", name: "Str Gain"},
    {id: "attributeintelligencegain", name: "Int Gain"},
    {id: "attributebaseagility", name: "Base Agi"},
    {id: "attributebaseintelligence", name: "Base Int"},
    {id: "attributebasestrength", name: "Base Str"},
    {id: "attributeprimary", name: "Primary Attr"},
    {id: "statushealth", name: "HP"},
    {id: "statusmana", name: "Mana"},
    {id: "statushealthregen", name: "HP Regen"},
    {id: "statusmanaregen", name: "Mana Regen"},
    {id: "movementspeed", name: "Movement Speed"},
    {id: "movementturnrate", name: "Turn Rate"},
    {id: "attackdamagemin", name: "Attack Damage Min"},
    {id: "attackdamagemax", name: "Attack Damage Max"},
    {id: "attackdamageavg", name: "Attack Damage Avg"},
    {id: "ehp", name: "EHP"},
    {id: "mehp", name: "Magical EHP"},
    {id: "dps", name: "DPS"},
    {id: "agility", name: "Agility"},
    {id: "intelligence", name: "Intelligence"},
    {id: "strength", name: "Strength"},
  ],
  attributes = attributeOptions.map(function (a) { return a.id; }),
  attributeModifiers = {
    armorphysical: function (level, bonusLevel) {
      return this.armorphysical + getAttributeAtLevel.call(this, 'DOTA_ATTRIBUTE_AGILITY', level, bonusLevel) * 0.14;
    },
    statushealth: function (level, bonusLevel) {
      return this.statushealth + getAttributeAtLevel.call(this, 'DOTA_ATTRIBUTE_STRENGTH', level, bonusLevel) * 20;
    },
    statusmana: function (level, bonusLevel) {
      return this.statusmana + getAttributeAtLevel.call(this, 'DOTA_ATTRIBUTE_INTELLECT', level, bonusLevel) * 12;
    },
    statushealthregen: function (level, bonusLevel) {
      return this.statushealthregen + getAttributeAtLevel.call(this, 'DOTA_ATTRIBUTE_STRENGTH', level, bonusLevel) * 0.03;
    },
    statusmanaregen: function (level, bonusLevel) {
      return this.statusmanaregen + getAttributeAtLevel.call(this, 'DOTA_ATTRIBUTE_INTELLECT', level, bonusLevel) * 0.04;
    },
    attackdamagemax: function (level, bonusLevel) {
      return this.attackdamagemax + getAttributeAtLevel.call(this, this.attributeprimary, level, bonusLevel);
    },
    attackdamagemin: function (level, bonusLevel) {
      return this.attackdamagemin + getAttributeAtLevel.call(this, this.attributeprimary, level, bonusLevel);
    },
    attackdamageavg: function (level, bonusLevel) {
      var maxDmg = attributeModifiers.attackdamagemax.apply(this, arguments);
      var minDmg = attributeModifiers.attackdamagemin.apply(this, arguments);
      return (maxDmg + minDmg) / 2;
    },
    ehp: function (level, bonusLevel) {
      var armor = attributeModifiers.armorphysical.apply(this, arguments);
      var health = attributeModifiers.statushealth.apply(this, arguments);
      return health / (1 - 0.06*armor / (1 + (0.06 * armor)));
    },
    mehp: function (level, bonusLevel) {
      var health = attributeModifiers.statushealth.apply(this, arguments);
      return health * (1 / (1 - this.magicalresistance / 100));
    },
    dps: function (level, bonusLevel) {
      var dmg = attributeModifiers.attackdamageavg.apply(this, arguments);
      var as = 100 + getAttributeAtLevel.call(this, 'DOTA_ATTRIBUTE_AGILITY', level, bonusLevel);
      return dmg * as / 100 / this.attackrate;
    },
    agility: function (level, bonusLevel) {
      return getAttributeAtLevel.call(this, 'DOTA_ATTRIBUTE_AGILITY', level, bonusLevel);
    },
    intelligence: function (level, bonusLevel) {
      return getAttributeAtLevel.call(this, 'DOTA_ATTRIBUTE_INTELLECT', level, bonusLevel);
    },
    strength: function (level, bonusLevel) {
      return getAttributeAtLevel.call(this, 'DOTA_ATTRIBUTE_STRENGTH', level, bonusLevel);
    },
  },
  getAttributeValue = function (hero, attribute) {
    if (attributeModifiers.hasOwnProperty(attribute)) {
      var args = Array.prototype.slice.call(arguments, 2);
      return attributeModifiers[attribute].apply(_herodata[hero], args);
    }
    else {
      return _herodata[hero][attribute];
    }
  },
  _herodata = null;
  
  function getAttributeAtLevel(attribute, level, bonusLevel) {
    var level = level || 1;
    var bonusLevel = bonusLevel || 0;
    return getAttributeBase.call(this, attribute) + getAttributeGain.call(this, attribute) * (level - 1) + bonusLevel * 2;
  }
  
  function getAttributeGain(attribute) {
    switch (attribute) {
      case 'DOTA_ATTRIBUTE_STRENGTH':
        return this.attributestrengthgain;
      break;
      case 'DOTA_ATTRIBUTE_AGILITY':
        return this.attributeagilitygain;
      break;
      case 'DOTA_ATTRIBUTE_INTELLECT':
        return this.attributeintelligencegain;
      break;
    }
  }
  
  function getAttributeBase(attribute) {
    switch (attribute) {
      case 'DOTA_ATTRIBUTE_STRENGTH':
        return this.attributebasestrength;
      break;
      case 'DOTA_ATTRIBUTE_AGILITY':
        return this.attributebaseagility;
      break;
      case 'DOTA_ATTRIBUTE_INTELLECT':
        return this.attributebaseintelligence;
      break;
    }
  }
  
  function getPrimaryAttributeGain() {
    return getAttributeGain(this.attributeprimary);
  }  
  
  function getPrimaryAttributeBase() {
    return getAttributeBase(this.attributeprimary);
  }
  
  return {
    attributes: attributes,
    attributeOptions: attributeOptions,
    attributeModifiers: attributeModifiers,
    getAttributeAtLevel: getAttributeAtLevel,
    getAttributeBase: getAttributeBase,
    getAttributeGain: getAttributeGain,
    getPrimaryAttributeBase: getPrimaryAttributeBase,
    getPrimaryAttributeGain: getPrimaryAttributeGain,
    getAttributeValue: getAttributeValue,
    getHeroData: function () {
      return _herodata || {};
    },
    init: function (callback) {
      getJSON("/media/dota-json/herodata.json", function (data) {
        _herodata = data;
        callback(data);
      });
    }
  };
})();

module.exports = KTLIB;
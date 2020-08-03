import dotenv from 'dotenv';
import { Database } from '../db';
import { BlueprintModel, Blueprint } from '../models/blueprint';
import * as fs from 'fs';
import { BatchUtils } from './batch-utils';
import { Blueprint as sharedBlueprint } from "../../../../blueprintnotincluded-lib/index";
import { ImageSource, BuildableElement, BuildMenuCategory, BuildMenuItem, BSpriteInfo, SpriteInfo, BSpriteModifier, SpriteModifier, BBuilding, OniItem, MdbBlueprint } from '../../../../blueprintnotincluded-lib';
import { PixiBackend } from '../../pixi-backend';
import app from '../../app';


export class UpdateThumbnail
{
  public db: Database;

  constructor() {

    console.log('Running batch UpdateThumbnail')

    // initialize configuration
    dotenv.config();
    console.log(process.env.ENV_NAME);

    // Read database
    let rawdata = fs.readFileSync('database.json').toString();
    let json = JSON.parse(rawdata);

    ImageSource.init();

    let elements: BuildableElement[] = json.elements;
    BuildableElement.init();
    BuildableElement.load(elements);

    let buildMenuCategories: BuildMenuCategory[] = json.buildMenuCategories;
    BuildMenuCategory.init();
    BuildMenuCategory.load(buildMenuCategories);

    let buildMenuItems: BuildMenuItem[] = json.buildMenuItems;
    BuildMenuItem.init();
    BuildMenuItem.load(buildMenuItems);

    let uiSprites: BSpriteInfo[] = json.uiSprites;
    SpriteInfo.init();
    SpriteInfo.load(uiSprites)

    let spriteModifiers: BSpriteModifier[] = json.spriteModifiers;
    SpriteModifier.init();
    SpriteModifier.load(spriteModifiers);
    
    let buildings: BBuilding[] = json.buildings;
    OniItem.init();
    OniItem.load(buildings);

    // initialize database and authentification middleware
    this.db = new Database();

    setTimeout(this.updateThumbnail, 3000);
  }

  async updateThumbnail() {

    await PixiBackend.initTextures();

    BlueprintModel.model.find({ }).sort({ createdAt: 1 })
      .then((blueprints) => {
        for (let index = blueprints.length - 1; index >= 0; index--) {
          console.log('==> Generating thumbnail for blueprint : ' + index + ' : ' +blueprints[index].name);
          
          let mdbBlueprint = blueprints[index].data as MdbBlueprint | null;
          let angularBlueprint: sharedBlueprint | null = new sharedBlueprint();
          angularBlueprint.importFromMdb(mdbBlueprint!);

          
          let newThumbnail = PixiBackend.pixiBackend.generateThumbnail(angularBlueprint);
          
          // Release memory
          mdbBlueprint = null;
          angularBlueprint = null;
          global.gc();

          
          blueprints[index].thumbnail = newThumbnail;
          blueprints[index].save()
          .then(() => { console.log('====> Save Ok for blueprint : ' + index + ' : ' +blueprints[index].name); })
          .catch(() => { console.log('====> Save Error for blueprint : ' + index + ' : ' +blueprints[index].name); })
          
        }
      });
  }
}

new UpdateThumbnail()
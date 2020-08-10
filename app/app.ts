import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { Routes } from './routes';
import { Database } from './api/db';
import requestIp from 'request-ip';
import { Auth } from './api/auth';
import passport from 'passport';
import * as fs from 'fs';
import { BBuilding, BuildableElement, OniItem, BuildMenuCategory, BuildMenuItem, BSpriteInfo, SpriteInfo, BSpriteModifier, SpriteModifier, ImageSource } from '../../blueprintnotincluded-lib/index'

class App
{
  public db: Database;
  public app: express.Application;
  public auth: Auth;
  public routePrv: Routes = new Routes();

  

  constructor() {

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
    this.auth = new Auth();

    // Create a new express application instance and add middleware
    this.app = express();
    this.app.use(requestIp.mw());
    this.app.use(express.json({limit:'1mb'}));
    this.app.use(passport.initialize());
    this.routePrv.routes(this.app);


    //PixiBackend.initTextures();

  }

}

export default new App().app;

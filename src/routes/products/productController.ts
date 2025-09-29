import { FeatureDetailTable, ProductTable,FeatureCardTable, ImageTable, TutorialLinkTable, DownloadCardTable ,LicenceInfoTable,PricingPlan,PlanFeature,BillingOption,PricingMetadata,} from '../../db/productSchema.ts';
import { db } from '../../db/index.ts';
import type { Request, Response } from 'express';
import { eq } from 'drizzle-orm';




export interface BillingOptionPayload {
  amount: number;               // client-side decimal (e.g. 4.99). Convert to cents before DB insert.
  currency?: string;            // e.g. "USD"
  interval?: string;            // e.g. "month" | "year"
  intervalCount?: number;       // e.g. 1, 12, etc.
  displayPrice?: string;        // e.g. "$4.99 / month" (for UI)
  savings?: number | null;      // optional numeric savings
  savingsPercentage?: number | null;
}


// map keyed by billingKey, e.g. { monthly: { ... }, yearly: { ... } }
export type BillingMap = Record<string, BillingOptionPayload>;


// single pricing plan payload (Basic / Pro / Max)
export interface PricingPlanPayload {
  id: string;                   // maps to pricing_plan.plan_key (must be unique per schema)
  name: string;                 // e.g. "Basic"
  displayName?: string;         // e.g. "Basic Plan"
  description?: string | null;
  popular?: boolean;
  features?: string[];          // list of feature strings
  billing?: BillingMap;         // billing options keyed by string
}


// product-level pricing metadata (one row per product)
export interface PricingMetadataPayload {
  default_currency?: string;    // e.g. "USD"
  tax_included?: boolean;
  free_trial_enabled?: boolean;
  free_trial_days?: number | null;
  refund_enabled?: boolean;
  refund_days?: number | null;
}




interface FeatureCardPayload {
  img: string;
  title: string;
  desc: string;
  link?: string;
  moreTitle?: string;
  moreDesc?: string;
}


interface FeatureDetailPayload {
  featureTitle: string;
  featureDesc?: string;
  featureCards?: FeatureCardPayload[];
}


interface ImagePayload {
  url: string;
  title?: string;
  description?: string;
}


interface TutorialLinkPayload {
  name: string;
  url: string;
  icon?: string;
  color?: string;
}


interface LicenceInfoPayload {
  title?: string;
  desc?: string;
  whatsapp?: string;
  instagram?: string;
  telegram?: string;
}


interface DownloadCardPayload {
  downloadLink?: string;
  title?: string;
  desc?: string;
  licenceInfo?: LicenceInfoPayload;
}


interface CreateProductPayload {
  productID: string; 
  title: string;
  desc?: string | null;
  logo?: string | null;
  banner?: string | null;
  isPaid?: boolean;
  features?: FeatureDetailPayload[];
  images?: ImagePayload[];
  tutorialLinks?: TutorialLinkPayload[];
  downloadCards?: DownloadCardPayload[];
  PricingPlan ?:PricingPlanPayload;
  pricingMetadata?:PricingMetadataPayload;
  
}



export async function listProduct(_req: Request, res: Response) {
  try{
const products = await db.select().from(ProductTable);
return res.status(200).json({products});  
  }catch(err){
    console.error("listProduct error:", err);
    return res.status(500).json({error:"Internal server error"});
  }
}




export async function getProductById(req: Request, res: Response) {
  try {
    const productId = req.params.id;


    // Get the main product
    const [product] = await db.select().from(ProductTable).where(eq(ProductTable.productID, productId));


    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }


    const result: any = { product };
    // Get features and their feature cards
    const features = await db.select().from(FeatureDetailTable).where(eq(FeatureDetailTable.productId, product.id));
    
    if (features.length) {
      result.features = [];
      for (const feature of features) {
        const featureCards = await db.select().from(FeatureCardTable).where(eq(FeatureCardTable.featureDetailId, feature.id));
        result.features.push({
          feature,
          cards: featureCards
        });
      }
    }


    // Get images
    const images = await db.select().from(ImageTable).where(eq(ImageTable.productId, product.id));
    if (images.length) {
      result.images = images;
    }


    // Get tutorial links
    const tutorialLinks = await db.select().from(TutorialLinkTable).where(eq(TutorialLinkTable.productId, product.id));
    if (tutorialLinks.length) {
      result.tutorialLinks = tutorialLinks;
    }


    // Get download cards and their licence info
    const downloadCards = await db.select().from(DownloadCardTable).where(eq(DownloadCardTable.productId, product.id));
    if (downloadCards.length) {
      result.downloadCards = [];
      for (const downloadCard of downloadCards) {
        const [licenceInfo] = await db.select().from(LicenceInfoTable).where(eq(LicenceInfoTable.downloadCardId, downloadCard.id));
        result.downloadCards.push({
          downloadCard,
          licenceInfo: licenceInfo || null
        });
      }
    }




    return res.status(200).json(result);


  } catch (err) {
    console.error("getProductById error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}


export async function getProductPriceByID(req: Request, res: Response) {
  try {
    const productId = req.params.id;

    // Get the main product
    const [product] = await db.select().from(ProductTable).where(eq(ProductTable.productID, productId));

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Only include basic product fields
    const result: any = { 
      product: {
        id: product.id,
        productID: product.productID,
        title: product.title,
        desc: product.desc,
        logo: product.logo,
        banner: product.banner,
        isPaid: product.isPaid
      }
    };

    // Get pricing plans with their billing options and features
    const pricingPlans = await db.select().from(PricingPlan).where(eq(PricingPlan.product_id, product.id));
    if (pricingPlans.length) {
      result.pricingPlans = [];
      for (const plan of pricingPlans) {
        // Get billing options for this plan
        const billingOptions = await db.select().from(BillingOption).where(eq(BillingOption.pricing_plan_id, plan.id));
        
        // Get plan features for this plan
        const planFeatures = await db.select().from(PlanFeature).where(eq(PlanFeature.pricing_plan_id, plan.id));
        
        result.pricingPlans.push({
          plan,
          billing: billingOptions,
          features: planFeatures
        });
      }
    }

    // Get pricing metadata
    const [pricingMetadata] = await db.select().from(PricingMetadata).where(eq(PricingMetadata.product_id, product.id));
    if (pricingMetadata) {
      result.pricingMetadata = pricingMetadata;
    }

    return res.status(200).json(result);

  } catch (err) {
    console.error("getProductPriceByID error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}




export async function createProduct(req: Request, res: Response) {
  
  console.log(req.userId)
  try {
    const body = req.body as CreateProductPayload;


    if (!body?.productID || !body?.title) {
      return res.status(400).json({ error: "productID and title are required" });
    }


    const result = await db.transaction(async (tx) => {
      // Insert product
      const [createdProduct] = await tx
        .insert(ProductTable)
        .values({
          productID: body.productID,
          title: body.title,
          desc: body.desc ?? null,
          logo: body.logo ?? null,
          banner: body.banner ?? null,
          isPaid: body.isPaid ?? false,
        })
        .returning();


      const inserted: any = { product: createdProduct };


      // Features and Feature Cards
      if (Array.isArray(body.features) && body.features.length) {
        inserted.features = [];
        for (const feature of body.features) {
          const [createdFeature] = await tx
            .insert(FeatureDetailTable)
            .values({
              featureTitle: feature.featureTitle,
              featureDesc: feature.featureDesc ?? null,
              productId: createdProduct.id,
            })
            .returning();


          const featureRecord: any = { feature: createdFeature, cards: [] };


          if (Array.isArray(feature.featureCards) && feature.featureCards.length) {
            const cardsToInsert = feature.featureCards.map((c) => ({
              img: c.img ?? null,
              title: c.title,
              desc: c.desc ?? null,
              link: c.link ?? null,
              moreTitle: c.moreTitle ?? null,
              moreDesc: c.moreDesc ?? null,
              featureDetailId: createdFeature.id,
            }));


            const createdCards = await tx.insert(FeatureCardTable).values(cardsToInsert).returning();
            featureRecord.cards = createdCards;
          }


          inserted.features.push(featureRecord);
        }
      }


      // Images
      if (Array.isArray(body.images) && body.images.length) {
        const imagesToInsert = body.images.map((i) => ({
          url: i.url,
          title: i.title ?? null,
          description: i.description ?? null,
          productId: createdProduct.id,
        }));


        const createdImages = await tx.insert(ImageTable).values(imagesToInsert).returning();
        inserted.images = createdImages;
      }


      // Tutorial links
      if (Array.isArray(body.tutorialLinks) && body.tutorialLinks.length) {
        const linksToInsert = body.tutorialLinks.map((l) => ({
          name: l.name,
          url: l.url,
          icon: l.icon ?? null,
          color: l.color ?? null,
          productId: createdProduct.id,
        }));


        const createdLinks = await tx.insert(TutorialLinkTable).values(linksToInsert).returning();
        inserted.tutorialLinks = createdLinks;
      }


      // Pricing plans (NOTE: expect body.pricingPlans)
      // Pricing plans (body.pricingPlans expected)
if (Array.isArray((body as any).pricingPlans) && (body as any).pricingPlans.length) {
  inserted.pricingPlans = [];


  for (const planPayload of (body as any).pricingPlans) {
    const [createdPlan] = await tx.insert(PricingPlan).values({
      plan_key: planPayload.id,
      name: planPayload.name,
      // display_name is NOT NULL in schema => fall back to name if missing
      display_name: planPayload.displayName ?? planPayload.name,
      description: planPayload.description ?? null,
      popular: planPayload.popular ?? false,
      product_id: createdProduct.id,
    }).returning();


    const planRecord: any = { plan: createdPlan, billing: [], features: [] };


    // Billing options (safe conversion to cents)
    if (planPayload.billing && typeof planPayload.billing === 'object') {
      const billingRows: any[] = [];


      for (const [billingKey, billingVal] of Object.entries(planPayload.billing)) {
        const rawAmount = (billingVal as any).amount ?? 0;
        const amountInt = Math.round(Number(rawAmount) * 100);


        const rawSavings = (billingVal as any).savings;
        const savingsInt = rawSavings != null && rawSavings !== '' ? Math.round(Number(rawSavings) * 100) : null;


        const rawSavingsPct = (billingVal as any).savingsPercentage;
        const savingsPctInt = rawSavingsPct != null && rawSavingsPct !== '' ? Math.round(Number(rawSavingsPct)) : null;


        billingRows.push({
          pricing_plan_id: createdPlan.id,
          billing_key: billingKey,
          amount: amountInt,
          currency: (billingVal as any).currency ?? 'USD',
          interval: (billingVal as any).interval ?? 'month',
          interval_count: (billingVal as any).intervalCount ?? 1,
          display_price: (billingVal as any).displayPrice ?? String(rawAmount),
          savings: savingsInt,
          savings_percentage: savingsPctInt,
        });
      }


      console.log('billingRows to insert:', JSON.stringify(billingRows, null, 2));
      if (billingRows.length) {
        const createdBilling = await tx.insert(BillingOption).values(billingRows).returning();
        planRecord.billing = createdBilling;
      }
    }


    // Plan features (correct column keys)
    if (Array.isArray(planPayload.features) && planPayload.features.length) {
      const featureRows = planPayload.features.map((feat: string) => ({
        pricing_plan_id: createdPlan.id,
        feature_text: feat,
      }));
      const createdPlanFeatures = await tx.insert(PlanFeature).values(featureRows).returning();
      planRecord.features = createdPlanFeatures;
    }


    inserted.pricingPlans.push(planRecord);
  }
}



      // Pricing metadata (outside the pricingPlans loop)
      if (body.pricingMetadata) {
        const pm = body.pricingMetadata;
        const [createdMetadata] = await tx.insert(PricingMetadata).values({
          product_id: createdProduct.id,
          default_currency: pm.default_currency ?? 'USD',
          tax_included: pm.tax_included ?? false,
          free_trial_enabled: pm.free_trial_enabled ?? false,
          free_trial_days: pm.free_trial_days ?? null,
          refund_enabled: pm.refund_enabled ?? false,
          refund_days: pm.refund_days ?? null,
        }).returning();


        inserted.pricingMetadata = createdMetadata;
      }


      // Download cards + licence info
      if (Array.isArray(body.downloadCards) && body.downloadCards.length) {
        inserted.downloadCards = [];


        for (const dc of body.downloadCards) {
          const [createdDownloadCard] = await tx
            .insert(DownloadCardTable)
            .values({
              downloadLink: dc.downloadLink ?? null,
              title: dc.title ?? null,
              desc: dc.desc ?? null,
              productId: createdProduct.id,
            })
            .returning();


          const dcRecord: any = { downloadCard: createdDownloadCard, licenceInfo: null };


          if (dc.licenceInfo) {
            const [createdLicence] = await tx
              .insert(LicenceInfoTable)
              .values({
                title: dc.licenceInfo.title ?? null,
                desc: dc.licenceInfo.desc ?? null,
                whatsapp: dc.licenceInfo.whatsapp ?? null,
                instagram: dc.licenceInfo.instagram ?? null,
                telegram: dc.licenceInfo.telegram ?? null,
                downloadCardId: createdDownloadCard.id,
              })
              .returning();


            dcRecord.licenceInfo = createdLicence;
          }


          inserted.downloadCards.push(dcRecord);
        }
      }


      return inserted;
    });


    return res.status(201).json({ message: "Product and related data created", data: result });
  } catch (err: any) {
    console.error("createProductWithRelations error:", err);


    if (err?.code === "23505") {
      return res.status(409).json({ error: "Duplicate productID or other unique constraint violated" });
    }


    return res.status(500).json({ error: "Internal server error" });
  }
}





// Updated `updateProduct` handler — replaces the previous implementation in your controller.
// Drop this function into your controller (keep your existing imports: db, tables, eq, Request/Response).


function toCents(amount: any): number {
  const n = Number(amount ?? 0);
  if (Number.isNaN(n)) return 0;
  return Math.round(n * 100);
}


export async function updateProduct(req: Request, res: Response) {
  const productParam = (req.params.id ?? req.params.product_id ?? "").toString();
  if (!productParam) return res.status(400).json({ message: 'Missing product id in params' });


  const body = req.body as any;


  try {
    // find product by productID
    const [existingProduct] = await db.select().from(ProductTable).where(eq(ProductTable.productID, productParam));
    if (!existingProduct) return res.status(404).json({ message: 'Product not found' });


    const result = await db.transaction(async (tx) => {
      const out: any = {};


      // 1) Top-level product update (only fields provided)
      const productPatch: any = {};
      if (body.title !== undefined) productPatch.title = body.title;
      if (body.desc !== undefined) productPatch.desc = body.desc;
      if (body.logo !== undefined) productPatch.logo = body.logo;
      if (body.banner !== undefined) productPatch.banner = body.banner;
      if (body.isPaid !== undefined) productPatch.isPaid = body.isPaid;


      if (Object.keys(productPatch).length) {
        const [updatedProduct] = await tx.update(ProductTable).set(productPatch).where(eq(ProductTable.productID, productParam)).returning();
        out.product = updatedProduct;
      } else {
        out.product = existingProduct;
      }


      const productId = existingProduct.id;


      // 2) Pricing metadata: upsert (insert if missing, otherwise update)
      if (body.pricingMetadata) {
        const pm = body.pricingMetadata;
        const [existingMeta] = await tx.select().from(PricingMetadata).where(eq(PricingMetadata.product_id, productId));


        if (existingMeta) {
          const [updatedMeta] = await tx
            .update(PricingMetadata)
            .set({
              default_currency: pm.default_currency ?? existingMeta.default_currency,
              tax_included: pm.tax_included ?? existingMeta.tax_included,
              free_trial_enabled: pm.free_trial_enabled ?? existingMeta.free_trial_enabled,
              free_trial_days: pm.free_trial_days ?? existingMeta.free_trial_days,
              refund_enabled: pm.refund_enabled ?? existingMeta.refund_enabled,
              refund_days: pm.refund_days ?? existingMeta.refund_days,
              updated_at: new Date(),
            })
            .where(eq(PricingMetadata.product_id, productId))
            .returning();


          out.pricingMetadata = updatedMeta;
        } else {
          const [createdMeta] = await tx.insert(PricingMetadata).values({
            product_id: productId,
            default_currency: pm.default_currency ?? 'USD',
            tax_included: pm.tax_included ?? false,
            free_trial_enabled: pm.free_trial_enabled ?? false,
            free_trial_days: pm.free_trial_days ?? null,
            refund_enabled: pm.refund_enabled ?? false,
            refund_days: pm.refund_days ?? null,
          }).returning();


          out.pricingMetadata = createdMeta;
        }
      }


      // 3) Pricing plans sync: create/update/delete plans and sync billing + features
      if (Array.isArray(body.pricingPlans)) {
        // fetch existing plans for this product
        const existingPlans = await tx.select().from(PricingPlan).where(eq(PricingPlan.product_id, productId));
        const existingMap = new Map(existingPlans.map((p: any) => [p.plan_key, p]));
        const incomingKeys = new Set((body.pricingPlans as any[]).map((p: any) => p.id));


        // delete plans not present in incoming payload
        for (const p of existingPlans) {
          if (!incomingKeys.has(p.plan_key)) {
            // cascade-like cleanup: billing + features then plan
            await tx.delete(BillingOption).where(eq(BillingOption.pricing_plan_id, p.id));
            await tx.delete(PlanFeature).where(eq(PlanFeature.pricing_plan_id, p.id));
            await tx.delete(PricingPlan).where(eq(PricingPlan.id, p.id));
          }
        }


        const plansOut: any[] = [];


        for (const planPayload of body.pricingPlans) {
          // either update existing plan or create new
          let planRow: any;
          const existingPlan = existingMap.get(planPayload.id);


          if (existingPlan) {
            const [updatedPlan] = await tx.update(PricingPlan).set({
              name: planPayload.name ?? existingPlan.name,
              display_name: planPayload.displayName ?? existingPlan.display_name,
              description: planPayload.description ?? existingPlan.description,
              popular: planPayload.popular ?? existingPlan.popular,
              updated_at: new Date(),
            }).where(eq(PricingPlan.id, existingPlan.id)).returning();


            planRow = updatedPlan;
          } else {
            const [createdPlan] = await tx.insert(PricingPlan).values({
              plan_key: planPayload.id,
              name: planPayload.name,
              display_name: planPayload.displayName ?? planPayload.name,
              description: planPayload.description ?? null,
              popular: planPayload.popular ?? false,
              product_id: productId,
            }).returning();


            planRow = createdPlan;
          }


          // --- Billing options: easiest and safe approach ---
          // delete existing billing options for this plan and re-insert the provided ones
          await tx.delete(BillingOption).where(eq(BillingOption.pricing_plan_id, planRow.id));


          let createdBilling: any[] = [];
          if (planPayload.billing && typeof planPayload.billing === 'object') {
            const billingRows: any[] = [];


            for (const [billingKey, billingVal] of Object.entries(planPayload.billing)) {
              const rawAmount = (billingVal as any).amount ?? 0;
              const amountInt = toCents(rawAmount);


              const rawSavings = (billingVal as any).savings;
              const savingsInt = rawSavings != null && rawSavings !== '' ? toCents(rawSavings) : null;


              const rawSavingsPct = (billingVal as any).savingsPercentage;
              const savingsPctInt = rawSavingsPct != null && rawSavingsPct !== '' ? Math.round(Number(rawSavingsPct)) : null;


              billingRows.push({
                pricing_plan_id: planRow.id,
                billing_key: billingKey,
                amount: amountInt,
                currency: (billingVal as any).currency ?? 'USD',
                interval: (billingVal as any).interval ?? 'month',
                interval_count: (billingVal as any).intervalCount ?? 1,
                display_price: (billingVal as any).displayPrice ?? String(rawAmount),
                savings: savingsInt,
                savings_percentage: savingsPctInt,
              });
            }


            if (billingRows.length) {
              createdBilling = await tx.insert(BillingOption).values(billingRows).returning();
            }
          }


          // --- Plan features: delete & re-insert (simple sync)
          await tx.delete(PlanFeature).where(eq(PlanFeature.pricing_plan_id, planRow.id));
          let createdPlanFeatures: any[] = [];
          if (Array.isArray(planPayload.features) && planPayload.features.length) {
            const featureRows = planPayload.features.map((feat: string) => ({
              pricing_plan_id: planRow.id,
              feature_text: feat,
            }));


            createdPlanFeatures = await tx.insert(PlanFeature).values(featureRows).returning();
          }


          plansOut.push({ plan: planRow, billing: createdBilling, features: createdPlanFeatures });
        }


        out.pricingPlans = plansOut;
      }


      return out;
    });


    return res.status(200).json({ message: 'Product updated', data: result });
  } catch (err: any) {
    console.error('updateProduct error:', err);
    return res.status(500).json({ error: 'Internal server error', detail: err?.message ?? String(err) });
  }
}






export async function deleteProduct(req: Request, res: Response) {
  const productParam = (req.params.id ?? req.params.product_id ?? "").toString();
  if (!productParam) {
    return res.status(400).json({ message: "Missing product id in params" });
  }

  try {
    const isNumeric = /^\d+$/.test(productParam);

    const result = await db.transaction(async (tx) => {
      // 1) Find the product
      const [product] = isNumeric
        ? await tx.select().from(ProductTable).where(eq(ProductTable.id, Number(productParam)))
        : await tx.select().from(ProductTable).where(eq(ProductTable.productID, productParam));

      if (!product) return { notFound: true };

      const productId = product.id;

      // 2) Delete pricing plans and their related data
      const pricingPlans = await tx
        .select()
        .from(PricingPlan)
        .where(eq(PricingPlan.product_id, productId));

      if (pricingPlans.length) {
        for (const plan of pricingPlans) {
          // Delete billing options for each plan
          await tx.delete(BillingOption).where(eq(BillingOption.pricing_plan_id, plan.id));
          
          // Delete plan features for each plan
          await tx.delete(PlanFeature).where(eq(PlanFeature.pricing_plan_id, plan.id));
        }
        
        // Delete the pricing plans themselves
        await tx.delete(PricingPlan).where(eq(PricingPlan.product_id, productId));
      }

      // 3) Delete pricing metadata
      await tx.delete(PricingMetadata).where(eq(PricingMetadata.product_id, productId));

      // 4) Delete licence info for download cards 
      const downloadCards = await tx
        .select()
        .from(DownloadCardTable)
        .where(eq(DownloadCardTable.productId, productId));

      if (downloadCards.length) {
        for (const dc of downloadCards) {
          // delete licence rows for each download card
          await tx.delete(LicenceInfoTable).where(eq(LicenceInfoTable.downloadCardId, dc.id));
        }
        // delete the download cards themselves
        await tx.delete(DownloadCardTable).where(eq(DownloadCardTable.productId, productId));
      }

      // 5) Delete feature cards -> feature details
      const featureDetails = await tx
        .select()
        .from(FeatureDetailTable)
        .where(eq(FeatureDetailTable.productId, productId));

      if (featureDetails.length) {
        for (const fd of featureDetails) {
          await tx.delete(FeatureCardTable).where(eq(FeatureCardTable.featureDetailId, fd.id));
        }
        await tx.delete(FeatureDetailTable).where(eq(FeatureDetailTable.productId, productId));
      }

      // 6) Delete images
      await tx.delete(ImageTable).where(eq(ImageTable.productId, productId));

      // 7) Delete tutorial links
      await tx.delete(TutorialLinkTable).where(eq(TutorialLinkTable.productId, productId));

      // 8) Finally delete the product
      await tx.delete(ProductTable).where(eq(ProductTable.id, productId));

      // return deleted product basic info so controller can respond
      return { deleted: product };
    });

    if ((result as any).notFound) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({ message: "Product deleted successfully", product: (result as any).deleted });
  } catch (err: any) {
    console.error("deleteProduct error:", err?.message ?? err, err?.stack ?? "");
    return res.status(500).json({
      message: "Internal server error",
      error: err?.message ?? String(err),
    });
  }
}



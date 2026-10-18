# AWS takedown — VIRS (account 964037930396)

**Completed 2026-09-25.** Verified across `us-east-1`, `us-east-2`, `us-west-1`, `us-west-2`, `eu-west-1`.

The live site was checked after every destructive step and never went down: `https://www.myvirs.com` → 200, apex → 308 redirect, `/api/words` → 200.

## What the old setup cost

**$59.44/month recurring, plus ~$32/year in domain renewals — about $745/year.**

Keep those two figures separate. July 2026's bill was $76.47, but $16.00 of that was the annual Amazon Registrar charge for two domains, which happened to fall in that month. It is not a monthly cost. The recurring rate is independently confirmed by the daily cost series, which sat at exactly **$1.93/day** for the week before teardown — $58.67/month, agreeing with the $59.44 figure to within ~1% (September usage ran marginally below July's).

July 2026, the last full month before teardown:

| Service | July 2026 |
| --- | --- |
| Elastic Load Balancing | $16.74 |
| Amazon Registrar (domain renewals) | $16.00 |
| RDS | $12.86 |
| VPC (public IPv4 addresses) | $11.16 |
| AWS WAF | $9.05 |
| EC2 compute | $7.74 |
| EC2 other (snapshots) | $1.26 |
| Route 53 | $1.01 |
| S3 | $0.63 |
| **Total** | **$76.47** |

Of which: **$59.44** was the recurring infrastructure the teardown removed, **$16.00** was the annual domain renewals, and **$1.01** was Route 53, which is being kept. Those three reconcile to the $76.45 total.

Replacement (Vercel + Neon) currently runs on free tiers. Remaining AWS cost is **~$0.55/month** — $0.50 for the one Route 53 hosted zone plus a few cents for the retained snapshot — and ~$16/yr to renew `myvirs.com`. That is **~$745/year down to ~$23/year.**

Measured daily cost confirms the teardown: **$1.93/day** every day from Sept 18–24, **$1.00** on Sept 25 (cut in half mid-teardown), **$0.00** on Sept 26. Month-to-date totals stay high because they include already-accrued spend; only the daily series reflects the current run rate.

## Saved before deletion

`~/Desktop/VIR-Backend-10.5-production-artifact.zip` — 268 MB, the artifact that actually ran in production, pulled from the Beanstalk bucket before it was emptied.

Worth noting: the Beanstalk version was labelled `VocabularyInReading_ver10.5`, but the JAR inside is **`VIR-Backend-6.3.8-SNAPSHOT.jar`**. Production was running an unreleased snapshot build.

## Deleted

| Resource | Identifier | Was costing |
| --- | --- | --- |
| Application Load Balancer | `myvirs` | ~$16/mo |
| WAF Web ACL | `myvirs_WAF` | ~$9/mo |
| Target group | `myvirs3` | – |
| **11 RDS snapshots** | 2017–2025 junk, incl. one named `is-this-needed-or-removable` | $0.38/mo (see note) |
| 2 Elastic IPs | released automatically with the ALB | ~$7/mo |
| S3 bucket, 22.4 GB | `elasticbeanstalk-us-east-1-964037930396` | ~$0.50/mo |
| S3 bucket | `cf-templates-1k49zgsr8cp6-us-east-1` | – |
| S3 bucket (empty, from a 2020 Textract experiment) | `textract-console-us-east-1-…` | – |
| 2 EBS snapshots | `snap-08ab116193f67ddae`, `snap-0f92c499289799374` | cents |
| 4 CloudWatch log groups | EB + two 2019 RDS error logs + `RDSOSMetrics` | – |
| ACM certificate | covered myvirs.com + vocabinreading.com | free |
| IAM instance profile + 4 roles | `aws-elasticbeanstalk-ec2-role`, `aws-elasticbeanstalk-service-role`, `virs2019`, `rds-monitoring-role` | free |
| 6 orphaned security groups | incl. `MySQL_Rules`, `myvir-load-balancer` | free |
| 2 EB applications, 71 stored versions | `VocabularyInReading`, `VocabularyInReading3` | – |
| Hosted zone | `vocabinreading.com` (`Z07533103M3GJB9WMNBHA`) | $0.50/mo |

### Note on the RDS snapshots — an earlier estimate in this doc was wrong

The RDS bill broke down, per day before teardown:

| Usage type | Per day | Per month |
| --- | --- | --- |
| `InstanceUsage:db.t4g.micro` | $0.3840 | **$11.68** |
| `RDS:GP2-Storage` (instance disk) | $0.0192 | $0.58 |
| `RDS:ChargedBackupUsage` (**all 12 snapshots together**) | $0.0134 | **$0.41** |

An earlier draft of this document estimated the snapshots at "several $/month" by summing each snapshot's `AllocatedStorage` to 125 GB and applying the per-GB backup rate. That was wrong: `AllocatedStorage` is the size of the *source database's disk*, not of the snapshot. Snapshots are incremental and compressed and these shared most of their blocks — actual charged backup usage was about **4.2 GB-months**, not 125 GB.

It also follows that snapshots were never "why RDS still charged with no instance." The RDS cost was the instance itself, which the Beanstalk termination had already removed; the month-to-date figure was simply accrued September 1–25 usage. Deleting the 11 snapshots was still correct housekeeping, but it saved ~$0.38/month, not several dollars.

### Things that did not go to plan

- **The snapshot list was longer than it first appeared.** An initial truncated listing showed 10; there were **12**. `test-db-snapshot` (20 GB) and `test-snapshot-3-23-2020` were only found on a full re-list. Lesson: never page a deletion inventory.
- **The EB bucket refused deletion twice.** First an Elastic Beanstalk bucket policy with an explicit `Deny s3:DeleteBucket`; then, with the policy removed, `BucketNotEmpty` because versioning was on — **609 object versions and delete markers** were still stored behind the "empty" bucket. Purged, then deleted.
- **The bucket came back.** Calling the EB API to terminate the environment recreated it. Deleted again after the applications were gone; confirmed it stayed gone.
- **`virs-prod-3` was not actually terminated.** The console reported success, but CloudFormation stack `awseb-e-d8qwphckji-stack` was in **`DELETE_FAILED`** and Beanstalk still listed the environment as `Ready`. Cause: security group `sg-04844a7def7484fa0` could not be deleted because `MySQL_Rules` (`sg-02b0d54415e36c844`) held an ingress rule on port 3306 referencing it. Revoking rule `sgr-0460c4b8858f6c3a7` unblocked it; the stack then deleted and the environment record was terminated properly.

## Kept deliberately

| Resource | Why |
| --- | --- |
| Route 53 hosted zone `Z3SK169GUWNT1B` (myvirs.com) | Live site DNS. Also where the Resend email verification records must go. |
| Domain `myvirs.com`, auto-renew **ON**, expires 2027-08-30 | The live site's name. |
| RDS snapshot `awseb-e-d8qwphckji-stack-snapshot-awsebrdsdatabase-s4vn2iz6mxhn` (5 GB) | Last copy of production MySQL. Delete after PO sign-off. |
| Security group `default` | Cannot be deleted; free. |

## vocabinreading.com — decommissioned

A second registered domain nobody had mentioned. Hosted zone deleted and **auto-renew disabled**; it expires **2027-04-18** and will lapse. `myvirs.com` auto-renew was left ON and confirmed.

## OPEN — needs a decision: 12 IAM users with live access keys

Not a cost issue. **9 access keys belonging to 8 former team members are still `Active`**, the oldest from 2017. Anyone holding one still has API access to this account.

| User | Created | Active keys | Key age |
| --- | --- | --- | --- |
| alfredo | 2017-10-04 | 1 | 2017 |
| jorge | 2020-01-14 | 1 | 2020 |
| julian | 2020-01-14 | 1 | 2020 |
| Adam | 2020-05-20 | 1 | 2020 |
| Christian | 2020-05-20 | 1 | 2020 |
| Daniel | 2020-05-20 | 2 | 2020 |
| Borys | 2020-05-20 | 2 | 2020 |
| Evers | 2023-03-05 | 1 | 2023 |
| Karol, Reiner | 2020-05-20 | none | – |
| **annferrn** | 2026-09-25 | 1 | current — Annie |
| **mhernandez** | 2026-09-25 | none | current — teammate |

Recommended: **deactivate** the 9 stale keys first (instant, fully reversible), confirm nothing breaks, then delete the 10 former-member users. Keep `annferrn` and `mhernandez`.

Also delete the `annferrn` access key created for this inventory once no longer needed.

## Verify and close out

1. Billing → **Cost Explorer**, daily granularity, grouped by Service. Billing lags ~48h.
2. Expected steady state: Route 53 ~$0.50/month and nothing else.
3. Set **Budgets → $1 alert**.

## Not AWS, still outstanding

Terminating the environment did **not** invalidate the credentials that were in its configuration:

- Revoke the **SendGrid API key**
- Change the password on **virssenior@gmail.com**
- Treat the Jasypt `APP_ENCRYPTION_PASSWORD` and the old RDS master password as compromised

## Consequence for image upload

The Beanstalk EC2 role carried **`AmazonTextractFullAccess`** — that was how the old app did image OCR. That role is now deleted, and there are no Textract credentials in Vercel.

Image upload is therefore dead until either a minimal Textract-only IAM user is created and its keys added to Vercel (pay-per-page, no idle cost), or the feature is formally dropped. This is the one feature already reported broken, so it needs an explicit decision rather than silence.

import React from 'react';
import Image from 'next/image';
import styles from './page.module.css';
import Link from 'next/link';
import SignInForm from '@/app/components/login/signinform/SignInForm';
import ResetPasswordForm from '@/app/components/login/resetpasswordform/ResetPasswordForm';

const ResetPassword: React.FC = ()  =>
{
    return (
        <div className={styles.home}>
            <Image
                src="/logo.png"
                alt={"Logo"}
                width={200}
                height={70}
                style={{objectFit: "cover", position: "absolute", top: 50, left: 50}}
                priority
            />
            <div className={styles.left}>
                <ResetPasswordForm />
            </div>
            <div className={styles.right}>
                <div className={styles.rightSquare}>
                    <span>
                        ¡Ya es hora de crear magia!
                    </span>
                    <div className={styles.rightCircle}>
                        <Image
                            src={"/bolt.png"}
                            width={30}
                            height={30}
                            style={{objectFit: "cover"}}
                            alt={"bg"}
                            priority
                        />
                    </div>
                    <Image
                        src={"/loginwoman.png"}
                        alt={"loginwoman"}
                        width={450}
                        height={450}
                        style={{
                            objectFit: "cover", position: "absolute", bottom: 0, right: -45,
                            WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 95%, rgba(0,0,0,0) 100%)",
                            maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 95%, rgba(0,0,0,0) 100%)"
                        }}
                        priority
                    />
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;